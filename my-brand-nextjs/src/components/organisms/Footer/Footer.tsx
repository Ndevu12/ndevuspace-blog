"use client";

import Link from "next/link";
import Image from "next/image";
import { SocialLink, FooterProps } from "@/types/navigation";

interface QuickLink {
  name: string;
  href: string;
}

interface ContactInfo {
  icon: React.ReactNode;
  content: React.ReactNode;
}

export function Footer({ className = "" }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const socialLinks: SocialLink[] = [
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/jean-paul-elisa",
      ariaLabel: "LinkedIn Profile",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
    {
      name: "GitHub",
      href: "https://github.com/Ndevu12",
      ariaLabel: "GitHub Profile",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
    },
    {
      name: "Email",
      href: "mailto:ndevulion@gmail.com",
      ariaLabel: "Email Contact",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M12 12.713l-11.985-9.713h23.97l-11.985 9.713zm0 2.574l-12-9.725v15.438h24v-15.438l-12 9.725z" />
        </svg>
      ),
    },
  ];

  const quickLinks: QuickLink[] = [
    { name: "Home", href: "/" },
    { name: "Skills", href: "/skills" },
    { name: "Projects", href: "/projects" },
    { name: "Blogs", href: "/blog" },
    { name: "Contact", href: "/#contactme" },
    { name: "Experience", href: "/experience" },
  ];

  const contactInfo: ContactInfo[] = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      content: (
        <span className="text-gray-600 dark:text-gray-400">
          Gikondo, Kigali, Rwanda
        </span>
      ),
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      content: (
        <a
          href="mailto:ndevulion@gmail.com"
          className="text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors duration-200"
        >
          ndevulion@gmail.com
        </a>
      ),
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      ),
      content: (
        <div className="text-gray-600 dark:text-gray-400">
          <div>+250 785044398 (WhatsApp only)</div>
          <div>+250 735007705 (call only)</div>
        </div>
      ),
    },
  ];

  const handleNewsletterSubmit = async (email: string) => {
    // Newsletter subscription logic would go here
    console.log(`Newsletter subscription from footer: ${email}`);
    // In a real app, you would send this to your backend
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  // Handle anchor link clicks for same-page navigation
  const handleAnchorClick = (href: string) => {
    if (href.startsWith("/#")) {
      const elementId = href.substring(2);
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer
      className={`bg-gray-100 dark:bg-footer-bg pt-16 pb-8 border-t border-gray-300 dark:border-gray-800/50 relative mt-20 transition-colors duration-300 ${className}`}
      id="main-footer"
    >
      {/* Wave SVG for top decoration */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-0 transform translate-y-[-85%] rotate-180">
        <svg
          className="relative block w-full h-[50px] md:h-[70px]"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-current text-gray-100 dark:text-footer-bg"
          />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-10">
          {/* Column 1: Logo and About */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <Link
              href="/"
              className="flex items-center group mb-4 transition-all duration-300"
              aria-label="NdevuSpace Home"
            >
              <div className="overflow-hidden rounded-lg mr-3 transform transition-all duration-300 group-hover:scale-105">
                <Image
                  src="/images/logo1.png"
                  alt="NdevuSpace Logo"
                  width={56}
                  height={56}
                  className="object-cover"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent group-hover:from-yellow-600 group-hover:to-yellow-500 dark:group-hover:from-yellow-300 dark:group-hover:to-yellow-500 transition-all duration-300">
                NdevuSpace
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-center md:text-left">
              Passionate about transforming ideas into elegant, scalable
              solutions. As a Full Stack Developer with expertise in modern
              technologies, I create digital experiences that connect, inspire,
              and drive meaningful impact across Africa and beyond.
            </p>
            <div className="flex gap-5 mt-4">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-secondary/50 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 shadow-lg hover:shadow-yellow-400/25"
                  aria-label={item.ariaLabel}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-5 relative inline-block">
              <span className="bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                Quick Links
              </span>
              <span className="absolute left-0 bottom-0 w-2/3 h-0.5 bg-gradient-to-r from-yellow-300 to-yellow-500"></span>
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={(e) => {
                      if (item.href.startsWith("/#")) {
                        e.preventDefault();
                        handleAnchorClick(item.href);
                      }
                    }}
                    className="text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-all duration-300 block py-1 pl-4 relative before:content-['→'] before:absolute before:left-0 before:opacity-0 before:transition-all before:duration-300 hover:before:opacity-100 hover:pl-6"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-5 relative inline-block">
              <span className="bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                Contact Info
              </span>
              <span className="absolute left-0 bottom-0 w-2/3 h-0.5 bg-gradient-to-r from-yellow-300 to-yellow-500"></span>
            </h3>
            <ul className="space-y-4">
              {contactInfo.map((item, index) => (
                <li key={index} className="flex items-start">
                  <div className="text-yellow-600 dark:text-yellow-400 mr-3 mt-1 flex-shrink-0">
                    {item.icon}
                  </div>
                  {item.content}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-6 border-t border-gray-300 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4 md:mb-0">
              &copy; {currentYear} NdevuSpace |{" "}
              <Link
                href="/auth/login"
                className="text-gray-500 hover:text-yellow-600 dark:text-gray-500 dark:hover:text-yellow-400 transition-colors duration-200"
              >
                Ndevu
              </Link>{" "}
              | All rights reserved
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Full Stack Software Developer |{" "}
              <span className="text-yellow-600 dark:text-yellow-500">
                Gikondo-Kigali
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
