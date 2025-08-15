
import Link from 'next/link';

interface Internship {
  id: number;
  title: string;
  description: string;
  category: string;
  image: string;
}

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

export default function Home() {
  // Mock data for featured internships
  const featuredInternships: Internship[] = [
    {
      id: 1,
      title: "Securing Pakistan's Digital Landscape",
      description: "Join our cybersecurity initiative to protect critical infrastructure and develop advanced security protocols.",
      category: "Cybersecurity",
      image: "https://img.freepik.com/premium-photo/blue-abstract-technology-business-science-background-ai-generated-image_210643-9244.jpg?w=2000"
    },
    {
      id: 2,
      title: "Revolutionizing AI with Blockchain",
      description: "Work on cutting-edge projects that combine artificial intelligence with blockchain technology.",
      category: "AI & Blockchain",
      image: "https://img.freepik.com/premium-photo/blue-abstract-technology-business-science-background-ai-generated-image_210643-9244.jpg?w=2000"
    },
    {
      id: 3,
      title: "Building Scalable Software Platforms",
      description: "Develop robust software solutions that can scale across multiple platforms and industries.",
      category: "Software Engineering",
      image: "https://img.freepik.com/premium-photo/blue-abstract-technology-business-science-background-ai-generated-image_210643-9244.jpg?w=2000"
    }
  ];

  // Mock data for testimonials
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Former Intern, Cybersecurity Division",
      content: "The internship helped me build practical skills that I use in my current job. The mentors were exceptional and truly invested in our success.",
      rating: 5,
      avatar: "https://img.freepik.com/premium-photo/blue-abstract-technology-business-science-background-ai-generated-image_210643-9244.jpg?w=2000"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Current Intern, AI Research",
      content: "I've gained invaluable experience working on real-world problems. The learning curve was steep but rewarding.",
      rating: 5,
      avatar: "https://img.freepik.com/premium-photo/blue-abstract-technology-business-science-background-ai-generated-image_210643-9244.jpg?w=2000"
    },
    {
      id: 3,
      name: "Amina Davis",
      role: "Alumni, Software Development",
      content: "This program changed the trajectory of my career. The exposure to industry-leading technologies was unparalleled.",
      rating: 5,
      avatar: "https://img.freepik.com/premium-photo/blue-abstract-technology-business-science-background-ai-generated-image_210643-9244.jpg?w=2000"
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
              <span className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-blue-600 bg-blue-50">
                Home
              </span>
              <Link href="/about" className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 hover:text-blue-600 hover:bg-gray-100">
                About
              </Link>
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
        <div className="absolute inset-0 bg-[url('https://img.freepik.com/premium-photo/blue-abstract-technology-business-science-background-ai-generated-image_210643-9244.jpg?w=2000')] "></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex items-center justify-center">
          <div className="text-center max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Welcome to INSA Internship Management Platform
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Streamline Your Internship Journey
            </p>
            <p className="text-lg text-blue-100 mb-10 leading-relaxed">
              INSA is creating a seamless, responsible internship system that connects students and institutions to shape the digital future.
            </p>
            <Link href="/login">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Internships */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Featured Internships</h2>
            <p className="text-gray-600">Explore our most popular opportunities</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredInternships.map((internship) => (
              <div 
                key={internship.id}
                className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300"
              >
                <img 
                  src={internship.image} 
                  alt={internship.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {internship.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{internship.title}</h3>
                  <p className="text-gray-600 mb-4">{internship.description}</p>
                  <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                    Learn More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">What our user says</h2>
            <p className="text-gray-600">Don't just take our word for it - hear from our community</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div 
                key={testimonial.id}
                className="bg-white rounded-lg p-6 shadow-md border border-gray-200"
              >
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div className="flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.12a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.12a1 1 0 00-1.175 0l-3.976 2.12c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.12c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
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