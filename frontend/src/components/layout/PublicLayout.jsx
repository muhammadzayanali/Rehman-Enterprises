import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import ScrollToTop from "./ScrollToTop.jsx";
import SearchModal from "../search/SearchModal.jsx";
import QuoteModal from "../inquiry/QuoteModal.jsx";
import { useUi } from "../../context/UiContext.jsx";

export default function PublicLayout() {
  const { toast } = useUi();

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <ScrollToTop />
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <SearchModal />
      <QuoteModal />
      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-[230] max-w-[90vw] -translate-x-1/2 rounded-full bg-ink px-5 py-2 text-center text-sm text-white shadow-soft">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
