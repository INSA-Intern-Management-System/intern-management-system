'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from "next/image";

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
  const [showSignIn, setShowSignIn] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Mock data for featured internships
  const featuredInternships: Internship[] = [
    {
      id: 1,
      title: "Securing Ethiopia’s Digital Landscape",
      description: "Join our cybersecurity initiative to protect critical infrastructure and develop advanced security protocols.",
      category: "Cybersecurity",
      image: "/cybersecurity.png"
    },
    {
      id: 2,
      title: "Revolutionizing AI with Blockchain",
      description: "Work on cutting-edge projects that combine artificial intelligence with blockchain technology.",
      category: "AI & Blockchain",
      image: "/AI_and_blockchain.png"
    },
    {
      id: 3,
      title: "Building Scalable Software Platforms",
      description: "Develop robust software solutions that can scale across multiple platforms and industries.",
      category: "Software Engineering",
      image: "/software-development.png"
    },
    {
      id: 4,
      title: "Data Science and Analytics",
      description: "Analyze complex datasets and extract meaningful insights to drive business decisions.",
      category: "Data Science",
      image: "/data-science.png"
    },
    {
      id: 5,
      title: "Cloud Infrastructure Management",
      description: "Manage and optimize cloud-based systems for maximum performance and security.",
      category: "Cloud Computing",
      image: "/cloud-computing.png"
    },
    {
      id: 6,
      title: "UX/UI Design Innovation",
      description: "Create intuitive and engaging user experiences for digital products and services.",
      category: "Design",
      image: "/design.png"
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
      avatar: "https://thumbs.dreamstime.com/z/application-portrait-young-business-woman-26070852.jpg"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Current Intern, AI Research",
      content: "I've gained invaluable experience working on real-world problems. The learning curve was steep but rewarding.",
      rating: 5,
      avatar: "https://toppng.com/uploads/preview/stock-person-png-stock-photo-man-11563049686zqeb9zmqjd.png"
    },
    {
      id: 3,
      name: "Amina Davis",
      role: "Alumni, Software Development",
      content: "This program changed the trajectory of my career. The exposure to industry-leading technologies was unparalleled.",
      rating: 5,
      avatar: "https://tse3.mm.bing.net/th/id/OIP.UvEURkwZNhAXGucjwjggygHaFk?rs=1&pid=ImgDetMain&o=7&rm=3"
    }
  ];

  const values = [
    {
      title: "Integrity and Accountability",
      description: "We uphold discipline, ethics, and confidentiality—entrusting interns with real tasks carried out with professionalism and accountability"
    },
    {
      title: "Growth Through Challenge",
      description: "We believe in pushing boundaries and embracing challenges as opportunities for development."
    },
    {
      title: "Innovation With Impact",
      description: "We nurture creativity and curiosity, encouraging interns to bring fresh ideas, explore new approaches, and contribute to meaningful projects."
    },
    {
      title: "collaboration and mentorship",
      description: "Interns at INSA are never alone. we  provide a culture of guidance, mentorship, and team work, because we rise by lifting each other."
    }
  ];

  // Track scroll position to update active navigation
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'features', 'contact'];
      const scrollPos = window.scrollY + 100; // Offset for better UX
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPos >= offsetTop && scrollPos < offsetTop + offsetHeight) {
            setActiveTab(section);
            break;
          }
        }
      }
    };

    // Check screen size
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', checkScreenSize);
    checkScreenSize();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const handleNavigation = (section: string) => {
    setActiveTab(section);
    setIsMenuOpen(false);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'features', label: 'Features' },
    { id: 'contact', label: 'Contact' }
  ];

  // Carousel functions
  const nextSlide = () => {
    if (isMobile) {
      if (currentSlide < featuredInternships.length - 1) {
        setCurrentSlide(currentSlide + 1);
      }
    } else {
      if (currentSlide < featuredInternships.length - 3) {
        setCurrentSlide(currentSlide + 1);
      }
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index: number) => {
    if (isMobile) {
      setCurrentSlide(Math.min(index, featuredInternships.length - 1));
    } else {
      const maxSlide = Math.max(0, featuredInternships.length - 3);
      setCurrentSlide(Math.min(index, maxSlide));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-800">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              {/* Logo Image */}
              <Image
                src="/logo.png"
                alt="INSA Logo"
                width={50}
                height={50}
              />
              {/* Brand Name */}
              <span className="text-l font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                INSA 
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                    activeTab === item.id 
                      ? 'text-blue-600 bg-blue-50 shadow-sm' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/login" className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition-all duration-300">
                Sign In
              </Link>
              <Link href="/signup" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md">
                Sign Up
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-4">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white/90 backdrop-blur-md border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                      activeTab === item.id 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="flex items-center space-x-4 px-3">
                    <Link href="/login" className="flex-1 border border-blue-600 text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition-all duration-300 text-center">
                      Sign In
                    </Link>
                    <Link href="/signup" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md text-center">
                      Sign Up
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/background.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-indigo-900/40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex items-center justify-center">
          <div className="text-center max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Welcome to <span className="bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">INSA</span> Internship Management Platform
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Streamline Your Internship Journey
            </p>
            <p className="text-lg text-blue-100 mb-10 leading-relaxed">
              A Centralized digital platform designed to manage Internships For Students,Company and Universities.
              Facilitating efficient communication, reporting and evaluation  
            </p>
            <button
              onClick={() => handleNavigation('features')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Get Started
            </button>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Mission</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Through cutting-edge technology, innovation, and sustained support, we will make INSA one of the most dominant internships platforms in Africa.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
               Our platform is designed to empower Ethiopian students by connecting 
               them with meaningful, skill-aligned internship opportunities that match
                their goals and aspirations. Whether they're looking to explore their 
                passions, gain real-world experience, or build industry-ready skills, we 
                 provide the tools and support to help them succeed.
              </p>
              <p className="text-gray-600 leading-relaxed">
               From internship discovery to final evaluation, we streamline the entire 
process. Students can easily search, apply, track progress, and receive 
feedback all in one intuitive system. We also enable institutions and 
organizations to manage, monitor, and mentor interns efficiently.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="w-85 h-85 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                 <div className="relative w-85 h-85 bg-[url('/mission.png')] bg-cover bg-center rounded-full flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <div className="text-white text-center">
                    <div className="text-2xl font-bold mb-1">OUR MISSION</div>
                    <div className="text-sm opacity-90">Empowering the Future</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 hover:shadow-lg hover:transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features/Internships Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Internships</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Explore our most popular opportunities and find the perfect internship for your career path
            </p>
          </div>
          
          <div className="relative">
            {/* Carousel Container */}
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ 
                  transform: isMobile 
                    ? `translateX(-${currentSlide * 100}%)` 
                    : `translateX(-${currentSlide * (100 / 3)}%)` 
                }}
              >
                {featuredInternships.map((internship) => (
                  <div 
                    key={internship.id}
                    className={isMobile 
                      ? "w-full px-4 flex-shrink-0" 
                      : "w-1/3 px-4 flex-shrink-0"
                    }
                  >
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl hover:transform hover:-translate-y-2 transition-all duration-300 h-full">
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={internship.image} 
                          alt={internship.title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                        <div className="absolute top-4 right-4">
                          <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {internship.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <p className="text-gray-500 text-sm font-medium mb-2">{internship.category}</p>
                        <h3 className="text-xl font-bold mb-3">{internship.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">{internship.description}</p>
                        <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center">
                          Learn more....
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Carousel Controls */}
            <div className="flex justify-center mt-8 space-x-4">
              <button 
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className={`p-2 rounded-full ${
                  currentSlide === 0 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } transition-colors duration-300`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex space-x-2">
                {featuredInternships.map((_, index) => {
                  const maxSlide = isMobile 
                    ? featuredInternships.length - 1 
                    : Math.max(0, featuredInternships.length - 3);
                  const totalPages = Math.max(1, maxSlide + 1);
                  
                  return (
                    index < totalPages && (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                          index === currentSlide
                            ? 'bg-blue-600' 
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    )
                  );
                })}
              </div>
              
              <button 
                onClick={nextSlide}
                disabled={currentSlide >= (isMobile ? featuredInternships.length - 1 : featuredInternships.length - 3)}
                className={`p-2 rounded-full ${
                  currentSlide >= (isMobile ? featuredInternships.length - 1 : featuredInternships.length - 3)
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } transition-colors duration-300`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Don't just take our word for it - hear from our community
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div 
                key={testimonial.id}
                className="bg-white rounded-xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full mr-4 ring-4 ring-blue-100"
                  />
                  <div>
                    <div className="font-bold text-lg">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">"{testimonial.content}"</p>
                <div className="flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.12a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.12a1 1 0 00-1.175 0l-3.976 2.12c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.12c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Community */}
      <section className="py-20 bg-gradient-to-br text-white"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}  >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Our Community</h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Grow your skills. Serve your country. Connect with future leaders in tech—all through INSA internship programs.
            </p>
            <Link href="/login" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg inline-block">
              Apply Now
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Get in touch with our team
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6">Get in Touch</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Have questions about our internship programs? We'd love to hear from you. Fill out the form and our team will get back to you as soon as possible.
              </p>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  <input 
                    type="email" 
                    placeholder="Your Email" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                <input 
                  type="text" 
                  placeholder="Subject" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                <textarea 
                  rows={5} 
                  placeholder="Your Message" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                ></textarea>
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                >
                  Send Message
                </button>
              </form>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white mr-4 shadow-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Address</h4>
                    <p className="text-gray-600">wollo sefer, Addis Ababa, Ethiopia</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white mr-4 shadow-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Phone</h4>
                    <p className="text-gray-600">+251-113--71-71-14</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white mr-4 shadow-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Email</h4>
                    <p className="text-gray-600">contact@insa.gov.et</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white mr-4 shadow-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Working Hours</h4>
                    <p className="text-gray-600">Monday - Friday: 8:30 AM - 5:00 PM</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12">
                <h4 className="font-bold text-lg mb-6">Follow Us</h4>
                <div className="flex space-x-6">
                  <a href="#" className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l.001.001L5.48 21.44c-2.476-1.801-4.194-4.45-4.758-7.527C.145 10.858.002 7.982.002 5.04 0 2.258.214.119 2.29.025l.14-.007h19.414c2.779 0 2.937 2.193 2.842 4.93-.096 2.754-.645 5.834-2.99 7.828l-5.91 5.04c-1.492 1.273-2.894 2.04-4.273 2.808 3.334.71 6.745.793 9.622-.262l-.047.016c2.635-.853 4.899-2.957 5.959-5.696l.011-.027c1.145-2.885.798-6.25-.892-8.875-1.69-2.623-4.37-4.1-7.15-4.1H5.838c-2.78 0-5.462 1.477-7.153 4.1-1.69 2.625-2.038 5.99-.892 8.875l.011.027c.453 1.07.76 2.25.892 3.436.06.57.1.962.123 1.244.024.282.034.438.034.438l-.001.004c0 2.842-.144 5.718-.722 8.776-.577 3.058-1.605 5.769-4.083 7.57l-.14.092H2.29l-.14-.007C.214 23.882.057 21.743.057 24z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center text-white hover:bg-blue-900 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
             <div className="flex items-center space-x-2">
              {/* Logo Image */}
              <Image
                src="/logo.png"
                alt="INSA Logo"
                width={55}
                height={55}
              />
              {/* Brand Name */}
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                INSA 
              </span>
            </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Connecting students and institutions to shape the digital future through innovative internship programs.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center text-white hover:bg-blue-900 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><button onClick={() => handleNavigation('home')} className="text-gray-400 hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => handleNavigation('about')} className="text-gray-400 hover:text-white transition-colors">About</button></li>
                <li><button onClick={() => handleNavigation('features')} className="text-gray-400 hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => handleNavigation('contact')} className="text-gray-400 hover:text-white transition-colors">Contact</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Contact Info</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  contact@insa.gov.et
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +251-113--71-71-14
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                 Addis Ababa, Ethiopia
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>© 2024 INSA Internship Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}