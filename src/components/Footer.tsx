'use client';

import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/projects', label: 'Projects' },
      { href: '/timer', label: 'Timer' },
      { href: '/reports', label: 'Reports' },
    ],
    company: [
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
    resources: [
      { href: '/docs', label: 'Documentation' },
      { href: '/help', label: 'Help Center' },
      { href: '/api', label: 'API' },
      { href: '/status', label: 'Status' },
    ],
  };

  const socialLinks = [
    { href: '#', icon: Github, label: 'GitHub' },
    { href: '#', icon: Twitter, label: 'Twitter' },
    { href: '#', icon: Linkedin, label: 'LinkedIn' },
    { href: 'mailto:support@worklogix.com', icon: Mail, label: 'Email' },
  ];

  return (
    <footer className="border-t border-base-300 bg-base-100/50">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <h3 className="text-2xl font-bold bg-linear-to-r from-purple-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                WorkLogix
              </h3>
            </Link>
            <p className="text-base-content/90 mb-6 max-w-sm">
              Track your time, manage projects, and boost your productivity with our intuitive time tracking solution.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="btn btn-ghost btn-circle btn-sm"
                  aria-label={social.label}
                >
                  <social.icon className="footer-icon w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4 footer-heading">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-base-content/90 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4 footer-heading">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-base-content/90 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold mb-4 footer-heading">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-base-content/90 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-base-300">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-base-content/80 text-sm flex items-center gap-1">
              © {currentYear} WorkLogix. Made with
              <Heart className="w-4 h-4 fill-error text-error" />
              for productivity.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="text-base-content/80 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-base-content/80 hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-base-content/80 hover:text-primary transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
