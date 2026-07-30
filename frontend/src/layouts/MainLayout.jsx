import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";

function MainLayout({ children }) {
  return (
    <div>
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6 bg-gray-100 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;