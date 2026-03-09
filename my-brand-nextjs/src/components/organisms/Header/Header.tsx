"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NavigationItem, HeaderProps } from "@/types/navigation";
import { useTheme } from "@/contexts/ThemeContext";

export function Header({ className = "" }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isDarkTheme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const navigation: NavigationItem[] = [
    { name: "Skills", href: "/skills" },
    { name: "About", href: "/#aboutme" },
    { name: "Blogs", href: "/blog" },
    { name: "Contact", href: "/#contactme" },
    { name: "Portfolio", href: "/projects" },
    { name: "Experience", href: "/experience" },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  };

  // Check if navigation item is active
  const isActive = (href: string) => {
    if (href.startsWith("/#")) {
      return (
        pathname === "/" &&
        typeof window !== "undefined" &&
        window.location.hash === href.substring(1)
      );
    }
    return pathname === href;
  };

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        isMenuOpen &&
        !target.closest("#mobile-menu") &&
        !target.closest("#mobile-menu-button")
      ) {
        setIsMenuOpen(false);
        document.body.style.overflow = "";
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Handle anchor link clicks for same-page navigation
  const handleAnchorClick = (href: string) => {
    if (href.startsWith("/#")) {
      const elementId = href.substring(2);
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setIsMenuOpen(false);
    document.body.style.overflow = "";
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-header-bg/95 backdrop-blur-sm transition-all duration-300 border-b border-gray-200 dark:border-gray-800/50 shadow-lg ${
        isScrolled ? "py-2" : "py-3"
      } px-4 ${className}`}
      id="main-header"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center group transition-all duration-300"
            aria-label="NdevuSpace Home"
          >
            <div className="overflow-hidden rounded-lg mr-3 transform transition-all duration-300 group-hover:scale-105">
              <Image
                src="/images/logo1.png"
                alt="NdevuSpace Logo"
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent group-hover:from-yellow-600 group-hover:to-yellow-500 dark:group-hover:from-yellow-300 dark:group-hover:to-yellow-500 transition-all duration-300">
              NdevuSpace
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="bg-gray-200 dark:bg-secondary/50 p-2 rounded-full border border-gray-300 dark:border-gray-700 hover:border-yellow-500 transition-all duration-300 transform hover:scale-105"
            aria-label={`Switch to ${isDarkTheme ? "light" : "dark"} theme`}
            title={`Switch to ${isDarkTheme ? "light" : "dark"} theme`}
          >
            {isDarkTheme ? (
              // Sun icon for light mode
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 fill-current text-yellow-400"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              // Moon icon for dark mode
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 fill-current text-gray-300"
                viewBox="0 0 20 20"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          {/* Mobile Menu Button */}
          <div className="block lg:hidden">
            <button
              id="mobile-menu-button"
              onClick={toggleMenu}
              className="flex items-center p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:border-yellow-500 bg-gray-200 dark:bg-secondary/50 transition-all duration-300 transform hover:scale-105"
              aria-expanded={isMenuOpen ? "true" : "false"}
              aria-label="Toggle mobile menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6 text-gray-800 dark:text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                ></path>
              </svg>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  if (item.href.startsWith("/#")) {
                    e.preventDefault();
                    handleAnchorClick(item.href);
                  }
                }}
                className={`text-gray-600 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-gray-100 dark:hover:bg-secondary/30 border border-transparent hover:border-yellow-400/20 relative before:content-[''] before:absolute before:bottom-0 before:left-1/2 before:w-0 before:h-0.5 before:bg-yellow-600 dark:before:bg-yellow-400 before:transition-all before:duration-300 before:transform before:-translate-x-1/2 hover:before:w-3/5 nav-link ${
                  isActive(item.href)
                    ? "text-yellow-600 dark:text-yellow-400 before:w-3/5 active-nav-item"
                    : ""
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] lg:hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsMenuOpen(false);
              document.body.style.overflow = "";
            }
          }}
        >
          <div
            className={`h-screen w-4/5 max-w-sm ml-auto bg-white dark:bg-secondary border-l border-gray-200 dark:border-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${
              isMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-center p-8 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 bg-gray-50 dark:bg-gray-900/50">
                <h2 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  Menu
                </h2>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    document.body.style.overflow = "";
                  }}
                  className="p-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all duration-200 transform hover:scale-110 hover:bg-gray-200 dark:hover:bg-gray-700/50 rounded-lg"
                  aria-label="Close menu"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-7 h-7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="p-8 flex flex-col space-y-6 flex-1 overflow-y-auto pt-12">
                <Link
                  href="/"
                  className={`block text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 py-5 px-6 rounded-lg text-xl font-medium transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700/30 border border-transparent hover:border-yellow-400/30 hover:pl-8 relative before:content-['→'] before:absolute before:left-6 before:opacity-0 before:transition-all before:duration-300 hover:before:opacity-100 ${
                    pathname === "/"
                      ? "text-yellow-600 dark:text-yellow-400 bg-gray-100 dark:bg-gray-700/30 border-yellow-400/30 pl-8 before:opacity-100"
                      : ""
                  }`}
                  onClick={() => {
                    setIsMenuOpen(false);
                    document.body.style.overflow = "";
                  }}
                >
                  Home
                </Link>
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      if (item.href.startsWith("/#")) {
                        e.preventDefault();
                        handleAnchorClick(item.href);
                      } else {
                        setIsMenuOpen(false);
                        document.body.style.overflow = "";
                      }
                    }}
                    className={`block text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 py-5 px-6 rounded-lg text-xl font-medium transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700/30 border border-transparent hover:border-yellow-400/30 hover:pl-8 relative before:content-['→'] before:absolute before:left-6 before:opacity-0 before:transition-all before:duration-300 hover:before:opacity-100 ${
                      isActive(item.href)
                        ? "text-yellow-600 dark:text-yellow-400 bg-gray-100 dark:bg-gray-700/30 border-yellow-400/30 pl-8 before:opacity-100"
                        : ""
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
