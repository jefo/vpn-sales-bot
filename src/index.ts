import { TelegramClient } from "@bot-machine/telegram-client";
import type { InlineKeyboardMarkup } from "@bot-machine/telegram-client";
import { DEMO_CONFIG, PLANS } from "./domain/plans";

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
	console.error("BOT_TOKEN is not set");
	process.exit(1);
}

const client = new TelegramClient(BOT_TOKEN);
const selectedPlan = new Map<number, number>();

const plansKeyboard: InlineKeyboardMarkup = {
	inline_keyboard: PLANS.map((plan) => [
		{
			text: `${plan.name} — $${plan.price}`,
			callback_data: `plan:${plan.id}`,
		},
	]),
};

async function showPlans(chatId: number): Promise<void> {
	const lines = PLANS.map(
		(plan) => `• <b>${plan.name}</b> — $${plan.price}\n  <i>${plan.description}</i>`,
	);

	await client.sendMessage({
		chat_id: chatId,
		text: `<b>Выберите тариф</b>\n\n${lines.join("\n")}`,
		parse_mode: "HTML",
		reply_markup: plansKeyboard,
	});
}

async function main(): Promise<void> {
	console.log("VPN demo bot is running");
	let offset = 0;

	while (true) {
		try {
			const updates = await client.getUpdates({ offset, timeout: 30 });

			for (const update of updates) {
				offset = update.update_id + 1;

				const query = update.callback_query;
				if (query) {
					const chatId = query.message?.chat.id;
					if (!chatId) continue;

					const data = query.data ?? "";

					if (data.startsWith("plan:")) {
						const id = Number(data.slice("plan:".length));
						const plan = PLANS.find((item) => item.id === id);
						if (!plan) continue;

						selectedPlan.set(chatId, id);

						await client.sendMessage({
							chat_id: chatId,
							text:
								`<b>${plan.name}</b>\n\n` +
								`К оплате: <b>$${plan.price}</b>\n` +
								`${plan.description}\n\n` +
								"Это демо: платёж имитируется, конфиг тестовый.",
							parse_mode: "HTML",
							reply_markup: {
								inline_keyboard: [
									[{ text: "Оплатить", callback_data: "pay" }],
									[{ text: "⬅️ К тарифам", callback_data: "back" }],
								],
							},
						});
					} else if (data === "pay") {
						await client.sendMessage({
							chat_id: chatId,
							text:
								"<b>Оплата прошла успешно.</b>\n\n" +
								"Ваш конфиг ниже. Сохраните его в файл <code>vpn.ovpn</code>.\n\n" +
								`<pre>${DEMO_CONFIG}</pre>`,
							parse_mode: "HTML",
						});
						selectedPlan.delete(chatId);
					} else if (data === "back") {
						await showPlans(chatId);
					}

					await client.answerCallbackQuery({
						callback_query_id: query.id,
					});
					continue;
				}

				const text = update.message?.text ?? "";
				if (text.startsWith("/start") || text === "/help") {
					await showPlans(update.message!.chat.id);
				}
			}
		} catch (error) {
			console.error("Bot loop error:", error);
			await new Promise((resolve) => setTimeout(resolve, 5_000));
		}
	}
}

main();
