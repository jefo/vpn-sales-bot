export type Plan = {
	id: number;
	name: string;
	price: number;
	description: string;
};

export const PLANS: Plan[] = [
	{ id: 1, name: "1 месяц", price: 10, description: "До 3 устройств" },
	{ id: 2, name: "6 месяцев", price: 50, description: "До 5 устройств, выгода 17%" },
	{ id: 3, name: "1 год", price: 90, description: "До 5 устройств, выгода 25%" },
];

export const DEMO_CONFIG = `client
dev tun
proto udp
remote vpn.example.com 1194
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-GCM
verb 3
# demo config, not a real server`;
