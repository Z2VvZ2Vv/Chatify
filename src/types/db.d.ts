type User = {
	email: string;
	id: string;
};

type Chat = {
	id: string,
	messages: Message[]
}

type Message = {
	id: string,
	senderId: string,
	receiverId: string,
	text: string,
	timestamp: number
}