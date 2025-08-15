// app/about/page.tsx - About Page
import Link from 'next/link';

export default function About() {
  const values = [
    {
      title: "Integrity and Accountability",
      description: "We uphold the highest standards of ethics and transparency in all our operations and relationships."
    },
    {
      title: "Growth Through Challenge",
      description: "We believe in pushing boundaries and embracing challenges as opportunities for development."
    },
    {
      title: "Inclusive and Impactful",
      description: "We create opportunities for diverse talents to contribute meaningfully to technological advancement."
    },
    {
      title: "Innovation and Adaptability",
      description: "We embrace change and continuously seek new ways to improve our platform and services."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">INSA</span>
              </div>
              <span className="text-xl font-bold">INSA Internship Hub</span>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Link href="/home" className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 hover:text-blue-600 hover:bg-gray-100">
                Home
              </Link>
              <span className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-blue-600 bg-blue-50">
                About
              </span>
              <Link href="/features" className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 hover:text-blue-600 hover:bg-gray-100">
                Features
              </Link>
              <Link href="/login" className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 hover:text-blue-600 hover:bg-gray-100">
                Sign In
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-[url('https://img.freepik.com/premium-photo/blue-abstract-technology-business-science-background-ai-generated-image_210643-9244.jpg?w=2000')] opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className=" text-center max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              About INSA Internship Hub
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              INSA is creating a seamless, responsible internship system that connects students and institutions to shape the digital future.
            </p>
            <p className="text-lg text-blue-100 mb-8 leading-relaxed">
              We're developing skilled, responsible interns through a streamlined system that connects students and institutions — all in service of Ethiopia's digital future.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our mission</h2>
              <p className="text-gray-600 mb-4">
                Through cutting-edge technology, innovation, and sustained support, we will make INSA one of the most dominant internships platforms in Africa.
              </p>
              <p className="text-gray-600 mb-4">
                Our goal is to be a key player in empowering Ethiopian students to build their skills and gain practical experience. We're committed to providing a platform where students can develop their talents and connect with organizations that need them.
              </p>
              <p className="text-gray-600">
                We believe in fostering a culture of excellence, integrity, and continuous learning. By connecting students with industry leaders, we're helping to bridge the gap between education and employment.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="w-64 h-64 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full blur-xl"></div>
                <div className="relative w-64 h-64 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-2xl font-bold mb-1">OUR MISSION</div>
                    <div className="text-sm">Empowering the Future</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Our values</h2>
            <p className="text-gray-600">The principles that guide everything we do</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg p-6 shadow-md border border-gray-200"
              >
                <div className="flex items-center mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Community */}
      <section className="py-16 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Join our community</h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Grow your skills. Serve your country. Connect with future leaders in tech—all through INSA internship programs.
            </p>
            <Link href="/login">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                Apply Now
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">INSA</span>
                </div>
                <span className="text-lg font-bold">INSA Internship Hub</span>
              </div>
              <p className="text-gray-400 text-sm">
                Connecting students and institutions to shape the digital future through innovative internship programs.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Contact Info</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>info@insainternship.com</li>
                <li>+92 300 1234567</li>
                <li>Islamabad, Pakistan</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Connect With Us</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Facebook</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500 text-sm">
            <p>© 2024 INSA Internship Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}