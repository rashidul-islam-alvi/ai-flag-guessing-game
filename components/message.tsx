type MessageProps = {
  role: "user" | "ai";
  content: string;
};

export default function Message({ role, content }: MessageProps) {
  const isUser = role === "user";
  return (
    <div className={`p-2 my-2 ${isUser ? "text-right" : "text-left"}`}>
      <div
        className={`inline-block px-4 py-2 rounded-2xl ${
          isUser ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
