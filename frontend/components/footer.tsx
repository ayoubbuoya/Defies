"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useState } from "react"
import {
    Github,
    Twitter,
    MessageCircle,
    FileText,
    HelpCircle,
    Shield,
    Cookie,
    ExternalLink,
    Zap,
    Sparkles,
    Activity,
} from "lucide-react"

export function Footer() {
    const currentYear = new Date().getFullYear()
    const [logoError, setLogoError] = useState(false)

    const socialLinks = [
        {
            name: "Twitter",
            href: "https://x.com/SeiDefies",
            icon: Twitter,
            color: "hover:text-blue-400",
        },
        {
            name: "GitHub",
            href: "https://github.com/ayoubbuoya/Defies",
            icon: Github,
            color: "hover:text-gray-300",
        },
    ]

    const documentationLinks = [
        {
            name: "Documentation",
            href: "/docs",
            icon: FileText,
        },
        {
            name: "Help Center",
            href: "/help",
            icon: HelpCircle,
        },
        {
            name: "API Reference",
            href: "/api-docs",
            icon: ExternalLink,
        },
        {
            name: "Status Page",
            href: "https://status.seimind.ai",
            icon: Activity,
        },
    ]

    const legalLinks = [
        {
            name: "Terms of Service",
            href: "/terms",
            icon: FileText,
        },
        {
            name: "Privacy Policy",
            href: "/privacy",
            icon: Shield,
        },
        {
            name: "Cookie Policy",
            href: "/cookies",
            icon: Cookie,
        },
        {
            name: "Disclaimer",
            href: "/disclaimer",
            icon: ExternalLink,
        },
    ]

    return (
        <footer className="bg-gray-950 border-t border-gray-800/50">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            {!logoError ? (
                                <Image
                                    src="/logo.png"
                                    alt="Defies Logo"
                                    width={40}
                                    height={40}
                                    className="w-10 h-10 object-contain"
                                    onError={() => setLogoError(true)}
                                />
                            ) : (
                                <div className="relative w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-white" />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse flex items-center justify-center">
                                        <Sparkles className="w-1.5 h-1.5 text-white" />
                                    </div>
                                </div>
                            )}
                            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Defies
                            </h3>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            The next generation of AI-powered Web3 intelligence platform. Get smart insights and assistance for your
                            blockchain journey.
                        </p>
                        <div className="flex items-center space-x-3">
                            {socialLinks.map((link) => (
                                <Button
                                    key={link.name}
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className={`text-gray-400 ${link.color} transition-colors duration-200`}
                                >
                                    <a href={link.href} target="_blank" rel="noopener noreferrer">
                                        <link.icon className="w-4 h-4" />
                                    </a>
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Documentation */}
                    <div className="space-y-4">
                        <h4 className="text-white font-semibold">Documentation</h4>
                        <ul className="space-y-2">
                            {documentationLinks.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center space-x-2"
                                        target={link.href.startsWith("http") ? "_blank" : undefined}
                                        rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                                    >
                                        <link.icon className="w-3 h-3" />
                                        <span>{link.name}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Community */}
                    <div className="space-y-4">
                        <h4 className="text-white font-semibold">Community</h4>
                        <ul className="space-y-2">

                            <li>
                                <a
                                    href="https://x.com/SeiDefies"
                                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center space-x-2"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Twitter className="w-3 h-3" />
                                    <span>Twitter Updates</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://github.com/ayoubbuoya/Defies"
                                    className="text-gray-400 hover:text-gray-300 transition-colors duration-200 text-sm flex items-center space-x-2"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Github className="w-3 h-3" />
                                    <span>GitHub Repository</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/blog"
                                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center space-x-2"
                                >
                                    <FileText className="w-3 h-3" />
                                    <span>Blog & Updates</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="space-y-4">
                        <h4 className="text-white font-semibold">Legal</h4>
                        <ul className="space-y-2">
                            {legalLinks.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center space-x-2"
                                    >
                                        <link.icon className="w-3 h-3" />
                                        <span>{link.name}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-gray-800/50 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <p className="text-gray-500 text-sm">
                        © {currentYear} Defies. All rights reserved. Built with ❤️ for the Web3 community.
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Powered by Sei Network</span>
                        <span>•</span>
                        <span>Version 1.0.0</span>
                        <span>•</span>
                        <a href="/changelog" className="hover:text-gray-400 transition-colors">
                            Changelog
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}