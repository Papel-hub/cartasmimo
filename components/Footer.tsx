
import {
  FaFacebook,
  FaInstagram,
} from "react-icons/fa";


export default function Footer() {

  return (
    <footer className="bg-red-900 text-white py-4 mt-12">
  <div className="max-w-7xl mx-auto px-2 flex flex-col md:flex-row justify-between items-center text-sm gap-4">
    <p>Mimo Meu e Seu | Copyright © 2025</p>
    <div className="flex space-x-4">
      <a href="#" className="hover:text-gray-300"><FaFacebook className="w-5 h-5" /></a>
      <a href="https://www.instagram.com/mimomeueseu/" className="hover:text-gray-300"><FaInstagram className="w-5 h-5" />
</a>
    </div>
  </div>
</footer>

  );
}
