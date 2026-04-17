import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "./components/Layout";
import { useConversations } from "./hooks/useConversations";
import { ChatPage } from "./pages/ChatPage";

function RootLayout() {
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const { createConversation } = useConversations();
  const navigate = useNavigate();

  const handleNewChat = async () => {
    try {
      const id = await createConversation();
      setActiveConversationId(id);
      navigate({ to: "/chat/$id", params: { id } });
    } catch {
      navigate({ to: "/" });
    }
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    navigate({ to: "/chat/$id", params: { id } });
  };

  return (
    <Layout
      activeConversationId={activeConversationId}
      onSelectConversation={handleSelectConversation}
      onNewChat={handleNewChat}
    >
      <Outlet />
    </Layout>
  );
}

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <ChatPage conversationId={null} />,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat/$id",
  component: function ChatRouteComponent() {
    const { id } = chatRoute.useParams();
    return <ChatPage conversationId={id} />;
  },
});

const routeTree = rootRoute.addChildren([indexRoute, chatRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
