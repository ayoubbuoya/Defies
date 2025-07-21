"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Github, Twitter, FileText, HelpCircle, Shield, MessageCircle, Sparkles, ExternalLink } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

export function Footer() {
    const [logoError, setLogoError] = useState(false)

    const footerLinks = {
        product: [
            { name: "Documentation", href: "#", icon: FileText },
            { name: "Help Center", href: "#", icon: HelpCircle },
            { name: "API Reference", href: "#", icon: FileText },
            { name: "Status", href: "#", icon: Sparkles },
        ],
        legal: [
            { name: "Terms of Service", href: "#", icon: Shield },
            { name: "Privacy Policy", href: "#", icon: Shield },
            { name: "Cookie Policy", href: "#", icon: Shield },
            { name: "Disclaimer", href: "#", icon: Shield },
        ],
        community: [
            { name: "Discord", href: "#", icon: MessageCircle },
            { name: "Twitter", href: "#", icon: Twitter },
            { name: "GitHub", href: "#", icon: Github },
            { name: "Blog", href: "#", icon: FileText },
        ],
    }

    const socialLinks = [
        { name: "Twitter", href: "https://twitter.com/seimind", icon: Twitter, color: "hover:text-blue-400" },
        { name: "GitHub", href: "https://github.com/seimind", icon: Github, color: "hover:text-gray-300" },
        { name: "Discord", href: "https://discord.gg/seimind", icon: MessageCircle, color: "hover:text-indigo-400" },
    ]

    return (
        <footer className="bg-gray-950 border-t border-gray-800 mt-auto">
            <div className="container mx-auto px-6 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="relative">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center overflow-hidden">
                                    {!logoError ? (
                                        <Image
                                            src="/logo.png"
                                            alt="SeiMind Logo"
                                            width={24}
                                            height={24}
                                            className="w-6 h-6 object-contain"
                                            onError={() => setLogoError(true)}
                                        />
                                    ) : (
                                        <Sparkles className="w-5 h-5 text-white" />
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    SeiMind
                                </h3>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                            AI-powered Web3 intelligence hub for the Sei blockchain ecosystem. Empowering traders and developers with
                            advanced analytics and insights.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center space-x-4">
                            {socialLinks.map((social) => (
                                <Button
                                    key={social.name}
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className={`text-gray-500 ${social.color} transition-colors duration-200 p-2`}
                                >
                                    <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.name}>
                                        <social.icon className="w-5 h-5" />
                                    </a>
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link) => (
                                <li key={link.name}>
                                    <Button
                                        variant="ghost"
                                        asChild
                                        className="text-gray-400 hover:text-white transition-colors duration-200 p-0 h-auto font-normal justify-start"
                                    >
                                        <a href={link.href} className="flex items-center space-x-2">
                                            <link.icon className="w-4 h-4" />
                                            <span>{link.name}</span>
                                            <ExternalLink className="w-3 h-3 opacity-50" />
                                        </a>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.name}>
                                    <Button
                                        variant="ghost"
                                        asChild
                                        className="text-gray-400 hover:text-white transition-colors duration-200 p-0 h-auto font-normal justify-start"
                                    >
                                        <a href={link.href} className="flex items-center space-x-2">
                                            <link.icon className="w-4 h-4" />
                                            <span>{link.name}</span>
                                        </a>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Community Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Community</h4>
                        <ul className="space-y-3">
                            {footerLinks.community.map((link) => (
                                <li key={link.name}>
                                    <Button
                                        variant="ghost"
                                        asChild
                                        className="text-gray-400 hover:text-white transition-colors duration-200 p-0 h-auto font-normal justify-start"
                                    >
                                        <a href={link.href} className="flex items-center space-x-2">
                                            <link.icon className="w-4 h-4" />
                                            <span>{link.name}</span>
                                            <ExternalLink className="w-3 h-3 opacity-50" />
                                        </a>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <Separator className="bg-gray-800 mb-8" />

                {/* Bottom Footer */}
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-500">
                        <p>© 2024 SeiMind. All rights reserved.</p>
                        <div className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span>All systems operational</span>
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Built on Sei Network</span>
                        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                        <span>Powered by AI</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
