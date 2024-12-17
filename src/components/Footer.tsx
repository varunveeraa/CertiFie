export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm">
          Powered by Blockchain | © {new Date().getFullYear()} Certificate Manager
        </p>
      </div>
    </footer>
  );
}