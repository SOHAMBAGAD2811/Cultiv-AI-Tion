"use client";
import { motion } from "framer-motion";
import { 
  Sprout, 
  ArrowRight, 
  Sparkles, 
  GraduationCap, 
  Users, 
  BarChart3, 
  MessageSquare, 
  Languages,
  Quote,
  Star,
  Send,
  MapPin,
  Mail,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  LucideIcon,
  Menu,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from './utils/supabase';
import type { Session } from '@supabase/supabase-js';
import { Button } from '../app/components/ui/button';
import { Input } from '../app/components/ui/input';
import { Textarea } from '../app/components/ui/textarea';
import { ImageWithFallback } from '../app/components/ImageWithFallback';

// ============================================
// TYPESCRIPT INTERFACES
// ============================================

interface NavItem {
  name: string;
  id: string;
}

interface Stat {
  value: string;
  label: string;
}

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}

interface Testimonial {
  name: string;
  location: string;
  role: string;
  image: string;
  text: string;
  rating: number;
}

interface ContactInfo {
  icon: LucideIcon;
  title: string;
  value: string;
  href: string;
}

interface FooterLink {
  name: string;
  href: string;
}

interface SocialLink {
  icon: LucideIcon;
  href: string;
  label: string;
}

// ============================================
// CONSTANTS
// ============================================

const HERO_BG: string = "https://images.unsplash.com/photo-1758524051910-60a8d324e110?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhZ3JpY3VsdHVyZSUyMHRlY2hub2xvZ3klMjBmYXJtZXJ8ZW58MXx8fHwxNzYxNzUwNDU4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const FIELD_IMG: string = "https://images.unsplash.com/photo-1691036740716-d849af1fc2fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMGZpZWxkJTIwYWVyaWFsJTIwdmlld3xlbnwxfHx8fDE3NjE3NTA0NTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const FARMER_IMG: string = "https://images.unsplash.com/photo-1618496899001-b58ebcbeef26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXJtZXIlMjBwb3J0cmFpdCUyMGhhcHB5fGVufDF8fHx8MTc2MTc1MDQ1OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

const features: Feature[] = [
  { icon: GraduationCap, title: 'Learning Center', description: 'Watch and learn smart farming tutorials from experts and enhance your agricultural knowledge.', gradient: 'from-[#2E7D32] to-[#1B5E20]' },
  { icon: Users, title: 'Community', description: 'Connect with farmers worldwide, share insights, and grow together in a supportive network.', gradient: 'from-[#388E3C] to-[#2E7D32]' },
  { icon: BarChart3, title: 'Business Analytics', description: 'Track your farm data, analyze profits, and make informed decisions with real-time insights.', gradient: 'from-[#F9A825] to-[#F57F17]' },
  { icon: MessageSquare, title: 'AI Assistant', description: 'Chat with your digital agricultural expert for instant answers and personalized recommendations.', gradient: 'from-[#FFA726] to-[#F9A825]' },
  { icon: Languages, title: 'Multilingual Support', description: 'Access the platform in your native language with support for multiple languages worldwide.', gradient: 'from-[#66BB6A] to-[#2E7D32]' },
];

const testimonials: Testimonial[] = [
  { name: 'Rajesh Kumar', location: 'Punjab, India', role: 'Rice Farmer', image: FARMER_IMG, text: 'Cultiv-AI-Tion transformed my farm! The AI assistant helped me increase my yield by 45% while reducing water usage. It\'s like having an agricultural expert available 24/7.', rating: 5 },
  { name: 'Maria Santos', location: 'São Paulo, Brazil', role: 'Coffee Plantation Owner', image: FARMER_IMG, text: 'The business analytics feature gave me insights I never had before. I can now predict market trends and plan my harvests accordingly. This platform is a game-changer!', rating: 5 },
  { name: 'John Williams', location: 'Iowa, USA', role: 'Corn & Soybean Farmer', image: FARMER_IMG, text: 'Being part of the Cultiv-AI-Tion community connected me with farmers worldwide. I learned new techniques and shared my own experiences. Together, we\'re stronger!', rating: 5 },
];

const scrollToSection = (section: string): void => {
  const element = document.getElementById(section.toLowerCase());
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

// ============================================
// MAIN APP COMPONENT
// ============================================

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      setSession(session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleGetStartedClick = () => {
    if (session) {
      router.push('/dashboard');
    } else {
      router.push('/signin');
    }
  };

  const navItems: NavItem[] = [
    { name: 'Home', id: 'home' },
    { name: 'Features', id: 'features' },
    { name: 'About', id: 'about' },
    { name: 'Contact', id: 'contact' },
  ];

  const heroTitleText: string = "Cultiv-AI-Tion";
  const heroTitleLetters: string[] = heroTitleText.split('');
  const heroTitleAnimationTime: number = heroTitleLetters.length * 0.08 + 0.5;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // Handle form submission logic here
  };

  return (
    <div className="relative min-h-screen bg-white overflow-x-hidden font-sans">
      {/* ================= HEADER ================= */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/40 border-b border-white/20 shadow-lg"
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('home')}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#F9A825] flex items-center justify-center shadow-lg">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <span className="font-['Poppins'] text-[#2E7D32]">Cultiv-AI-Tion 🌾</span>
          </motion.div>
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item, index) => (
              <motion.button key={item.id} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 + 0.3 }} onClick={() => scrollToSection(item.id)} className="relative group text-gray-700 hover:text-[#2E7D32] transition-colors duration-300">
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#2E7D32] to-[#F9A825] group-hover:w-full transition-all duration-300 shadow-[0_0_8px_rgba(46,125,50,0.5)]" />
              </motion.button>
            ))}
          </nav>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-lg bg-[#2E7D32]/10 hover:bg-[#2E7D32]/20 transition-colors z-50">
            {isMenuOpen ? <X className="w-6 h-6 text-[#2E7D32]" /> : <Menu className="w-6 h-6 text-[#2E7D32]" />}
          </button>
          {isMenuOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute top-0 left-0 w-full h-screen bg-white/90 backdrop-blur-lg flex flex-col items-center justify-center gap-8 md:hidden">
              {navItems.map((item) => (
                <button key={item.id} onClick={() => { scrollToSection(item.id); setIsMenuOpen(false); }} className="text-2xl text-gray-700 hover:text-[#2E7D32] transition-colors">{item.name}</button>
              ))}
            </motion.div>
          )}
        </div>
      </motion.header>

      <main>
        {/* ================= HERO ================= */}
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F0F8F5] via-[#E8F5E9] to-[#F0F8F5]" />
          <div className="absolute inset-0 opacity-10"><ImageWithFallback src={HERO_BG} alt="Modern Agriculture" fill style={{objectFit:"cover"}} /></div>
          <div className="relative z-10 container mx-auto px-6 py-20 text-center">
            <h1 className="font-['Poppins'] text-6xl md:text-8xl mb-6 leading-tight max-w-5xl mx-auto">
              {heroTitleLetters.map((letter, index) => (
                <motion.span key={index} initial={{ opacity: 0, y: 20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }} className="inline-block" style={{ textShadow: '0 0 20px rgba(46, 125, 50, 0.5), 0 0 40px rgba(249, 168, 37, 0.3)', background: 'linear-gradient(135deg, #2E7D32 0%, #F9A825 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {letter === '-' ? '-' : letter}
                </motion.span>
              ))}
            </h1>
            <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: heroTitleAnimationTime + 0.3, duration: 0.8, ease: "easeOut" }} className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto font-['Inter']">
              Where technology meets the soil — transforming agriculture with AI innovation
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: heroTitleAnimationTime + 1, duration: 0.6 }} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={handleGetStartedClick} className="bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] hover:from-[#1B5E20] hover:to-[#2E7D32] text-white shadow-2xl hover:shadow-[0_0_30px_rgba(46,125,50,0.5)] transition-all duration-300 rounded-full px-8 py-6 text-base group">
                  Get Started <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={() => scrollToSection('about')} className="border-2 border-[#2E7D32] text-[#2E7D32] hover:bg-[#2E7D32]/10 bg-white/60 backdrop-blur-sm shadow-lg rounded-full px-8 py-6 text-base">Learn More</Button>
              </motion.div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: heroTitleAnimationTime + 1.5, duration: 0.8 }} className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {([{ value: '50K+', label: 'Active Farmers' }, { value: '98%', label: 'Success Rate' }, { value: '2M+', label: 'Acres Managed' }] as Stat[]).map((stat, index) => (
                <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: heroTitleAnimationTime + 1.7 + index * 0.1 }} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
                  <div className="text-4xl text-[#F9A825] mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section id="features" className="relative py-24 bg-gradient-to-b from-white to-[#F0F8F5]">
          <div className="container mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
              <h2 className="font-['Poppins'] text-4xl md:text-5xl text-[#2E7D32] mb-4">Powerful Features</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">Everything you need to transform your farming operations with cutting-edge technology</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
              {features.map((feature, index) => (
                <motion.div key={feature.title} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1, duration: 0.5 }} whileHover={{ y: -10, scale: 1.02 }} className="group relative">
                  <div className="relative h-full bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50 overflow-hidden transition-all duration-300 hover:shadow-2xl">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                    <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }} className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-[0_0_30px_rgba(46,125,50,0.4)]`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="font-['Poppins'] text-[#2E7D32] mb-3">{feature.title}</h3>
                    <p className="text-gray-600 font-['Inter']">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= ABOUT ================= */}
        <section id="about" className="relative py-24 bg-gradient-to-b from-[#F0F8F5] to-white overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                <h2 className="font-['Poppins'] text-4xl md:text-5xl text-[#2E7D32] mb-6">About Cultiv-AI-Tion</h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">We are bridging the gap between traditional farming and modern technology, empowering farmers with AI-driven insights, blockchain transparency, and smart analytics to maximize productivity and sustainability.</p>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {([{ value: '40%', label: 'Yield Increase' }, { value: '60%', label: 'Cost Reduction' }] as Stat[]).map((stat, index) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 + index * 0.1 }} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#2E7D32]/20">
                      <div className="text-3xl text-[#F9A825] mb-2">{stat.value}</div>
                      <div className="text-gray-700">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed">Our mission is to make advanced agricultural technology accessible to every farmer, regardless of their location or resources. Through our platform, farmers gain access to expert knowledge, community support, and powerful analytics tools.</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <ImageWithFallback src={FIELD_IMG} alt="Agricultural Fields" fill style={{objectFit:"cover"}} className="!relative w-full h-[500px]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2E7D32]/60 to-transparent" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ================= TESTIMONIALS ================= */}
        <section className="relative py-24 bg-gradient-to-b from-white to-[#F0F8F5] overflow-hidden">
          <div className="container mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
              <h2 className="font-['Poppins'] text-4xl md:text-5xl text-[#2E7D32] mb-4">What Farmers Say</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">Real stories from farmers who transformed their operations with Cultiv-AI-Tion</p>
            </motion.div>
            <div className="relative max-w-5xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div key={testimonial.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: index === activeIndex ? 1 : 0, scale: index === activeIndex ? 1 : 0.9, display: index === activeIndex ? 'block' : 'none' }} transition={{ duration: 0.5 }} className="relative">
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="w-16 h-16 bg-gradient-to-br from-[#F9A825] to-[#F57F17] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                      <Quote className="w-8 h-8 text-white" />
                    </motion.div>
                    <div className="flex gap-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (<Star key={i} className="w-5 h-5 fill-[#F9A825] text-[#F9A825]" />))}
                    </div>
                    <p className="text-xl text-gray-700 mb-8 leading-relaxed italic">&ldquo;{testimonial.text}&rdquo;</p>
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden ring-4 ring-[#2E7D32]/20">
                        <ImageWithFallback src={testimonial.image} alt={testimonial.name} fill style={{objectFit:"cover"}} />
                      </div>
                      <div>
                        <h4 className="text-[#2E7D32]">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                        <p className="text-sm text-gray-500">{testimonial.location}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div className="flex justify-center gap-3 mt-8">
                {testimonials.map((_, index) => (<button key={index} onClick={() => setActiveIndex(index)} className={`transition-all duration-300 rounded-full ${index === activeIndex ? 'w-12 h-3 bg-gradient-to-r from-[#2E7D32] to-[#F9A825]' : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'}`} />))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= CONTACT ================= */}
        <section id="contact" className="relative py-24 bg-gradient-to-b from-[#F0F8F5] to-white overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                <h2 className="font-['Poppins'] text-4xl md:text-5xl text-[#2E7D32] mb-4">Get In Touch</h2>
                <p className="text-xl text-gray-600 mb-8">Have questions? We are here to help you transform your farming experience.</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                      <label className="block text-[#2E7D32] mb-2">First Name</label>
                      <Input placeholder="John" className="bg-white/80 backdrop-blur-sm border-[#2E7D32]/20 focus:border-[#2E7D32] rounded-xl" />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                      <label className="block text-[#2E7D32] mb-2">Last Name</label>
                      <Input placeholder="Doe" className="bg-white/80 backdrop-blur-sm border-[#2E7D32]/20 focus:border-[#2E7D32] rounded-xl" />
                    </motion.div>
                  </div>
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
                    <label className="block text-[#2E7D32] mb-2">Email</label>
                    <Input type="email" placeholder="john@example.com" className="bg-white/80 backdrop-blur-sm border-[#2E7D32]/20 focus:border-[#2E7D32] rounded-xl" />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
                    <label className="block text-[#2E7D32] mb-2">Phone</label>
                    <Input type="tel" placeholder="+1 (234) 567-890" className="bg-white/80 backdrop-blur-sm border-[#2E7D32]/20 focus:border-[#2E7D32] rounded-xl" />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }}>
                    <label className="block text-[#2E7D32] mb-2">Message</label>
                    <Textarea placeholder="Tell us about your farm and how we can help..." rows={6} className="bg-white/80 backdrop-blur-sm border-[#2E7D32]/20 focus:border-[#2E7D32] rounded-xl resize-none" />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.6 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="submit" className="w-full bg-gradient-to-r from-[#2E7D32] to-[#F9A825] hover:from-[#1B5E20] hover:to-[#F57F17] text-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl py-6 group">
                      Send Message <Send className="ml-2 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Button>
                  </motion.div>
                </form>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="space-y-8">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
                  <h3 className="font-['Poppins'] text-2xl text-[#2E7D32] mb-6">Contact Information</h3>
                  <div className="space-y-6">
                    {([{ icon: Mail, title: 'Email', value: 'hello@cultivaition.com', href: 'mailto:hello@cultivaition.com' }, { icon: Phone, title: 'Phone', value: '+1 (234) 567-890', href: 'tel:+1234567890' }, { icon: MapPin, title: 'Address', value: 'Global Agricultural Hub, Worldwide Service', href: '#' }] as ContactInfo[]).map((item, index) => (
                      <motion.a key={item.title} href={item.href} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ x: 5 }} className="flex items-start gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2E7D32] to-[#F9A825] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow flex-shrink-0">
                          <item.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-[#2E7D32] mb-1">{item.title}</h4>
                          <p className="text-gray-600">{item.value}</p>
                        </div>
                      </motion.a>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="relative bg-gradient-to-br from-[#2E7D32] via-[#1B5E20] to-[#2E7D32] text-white overflow-hidden">
        <div className="relative z-10 container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white to-[#F9A825] flex items-center justify-center shadow-lg">
                  <Sprout className="w-6 h-6 text-[#2E7D32]" />
                </div>
                <span className="font-['Poppins'] text-xl">Cultiv-AI-Tion 🌾</span>
              </div>
              <p className="text-white/80 mb-6 font-['Inter']">Empowering farmers worldwide with AI, blockchain, and smart analytics for sustainable agriculture.</p>
              <div className="flex gap-3">
                {([{ icon: Facebook, href: '#', label: 'Facebook' }, { icon: Twitter, href: '#', label: 'Twitter' }, { icon: Instagram, href: '#', label: 'Instagram' }, { icon: Linkedin, href: '#', label: 'LinkedIn' }] as SocialLink[]).map((social) => (
                  <motion.a key={social.label} href={social.href} whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-[#F9A825] transition-all duration-300 shadow-lg" aria-label={social.label}>
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
              <h3 className="font-['Poppins'] text-xl mb-4">Quick Links</h3>
              <ul className="space-y-3">
                {([{ name: 'Home', href: '#home' }, { name: 'Features', href: '#features' }, { name: 'About', href: '#about' }, { name: 'Contact', href: '#contact' }] as FooterLink[]).map((link) => (<li key={link.name}><a href={link.href} className="text-white/80 hover:text-[#F9A825] transition-colors duration-300">{link.name}</a></li>))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
              <h3 className="font-['Poppins'] text-xl mb-4">Resources</h3>
              <ul className="space-y-3">
                {([{ name: 'Learning Center', href: '#' }, { name: 'Community', href: '#' }, { name: 'Business Analytics', href: '#' }, { name: 'AI Assistant', href: '#' }] as FooterLink[]).map((link) => (<li key={link.name}><a href={link.href} className="text-white/80 hover:text-[#F9A825] transition-colors duration-300">{link.name}</a></li>))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}>
              <h3 className="font-['Poppins'] text-xl mb-4">Contact Us</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3"><Mail className="w-5 h-5 text-[#F9A825] mt-0.5" /><a href="mailto:hello@cultivaition.com" className="text-white/80 hover:text-[#F9A825] transition-colors">hello@cultivaition.com</a></li>
                <li className="flex items-start gap-3"><Phone className="w-5 h-5 text-[#F9A825] mt-0.5" /><a href="tel:+1234567890" className="text-white/80 hover:text-[#F9A825] transition-colors">+1 (234) 567-890</a></li>
                <li className="flex items-start gap-3"><MapPin className="w-5 h-5 text-[#F9A825] mt-0.5" /><span className="text-white/80">Global Agricultural Hub<br />Worldwide Service</span></li>
              </ul>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }} className="pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/70 text-sm font-['Inter']">© Cultiv-AI-Tion 2025 – All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-white/70 hover:text-[#F9A825] transition-colors">Privacy Policy</a>
              <a href="#" className="text-white/70 hover:text-[#F9A825] transition-colors">Terms of Service</a>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
