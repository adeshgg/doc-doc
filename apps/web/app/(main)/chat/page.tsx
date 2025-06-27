import { Chat } from "@/components/chat"
import { generateId } from "ai"

const ChatPage = async () => {
  const chatId = generateId()

  return <Chat key={chatId} id={chatId} initialMessages={[]} />
}

export default ChatPage
