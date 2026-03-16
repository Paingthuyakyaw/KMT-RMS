import MainLayout from "@/layout/main-layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    // try {
    //   await fetchVerfiy(useBoundStore.getState().token);
    //   // useBoundStore.getState().setUser(data.data);
    // } catch (err) {
    //   console.log(err, "before load auth error");
    //   useBoundStore.getState().removeAuth();
    //   throw redirect({
    //     to: "/login",
    //     search: {
    //       redirect: location.href,
    //     },
    //   });
    // }
  },
  component: RouteComponent,
  //   notFoundComponent() {
  //     return <NotFound />;
  //   },
});

function RouteComponent() {
  return <MainLayout />;
}
