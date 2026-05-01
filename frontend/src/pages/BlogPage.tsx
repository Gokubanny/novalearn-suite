import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FadeIn, StaggerContainer, staggerItemVariants, HoverCard } from "@/components/motion";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { images } from "@/lib/images";
import {
  Search,
  Calendar,
  Clock,
  User,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Lightbulb,
  GraduationCap,
} from "lucide-react";
import { Link } from "react-router-dom";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  readTime: string;
  featured?: boolean;
}

const categories = [
  { name: "All", icon: BookOpen },
  { name: "EdTech Trends", icon: TrendingUp },
  { name: "Tips & Guides", icon: Lightbulb },
  { name: "Case Studies", icon: GraduationCap },
  { name: "Product Updates", icon: BookOpen },
];

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Future of AI in Education: How Nigerian Universities Are Adapting",
    excerpt: "Explore how artificial intelligence is transforming teaching methodologies and student engagement across Nigerian higher education institutions.",
    image: images.technology.laptop,
    category: "EdTech Trends",
    author: {
      name: "Dr. Amara Okafor",
      avatar: images.testimonials.person2,
    },
    date: "Feb 2, 2026",
    readTime: "8 min read",
    featured: true,
  },
  {
    id: "2",
    title: "5 Ways Biometric Attendance Reduces Academic Fraud",
    excerpt: "Learn how facial recognition and fingerprint technology are helping institutions maintain academic integrity and accurate records.",
    image: images.features.biometric,
    category: "Tips & Guides",
    author: {
      name: "Prof. Chukwudi Eze",
      avatar: images.testimonials.person1,
    },
    date: "Jan 28, 2026",
    readTime: "5 min read",
  },
  {
    id: "3",
    title: "Lagos State University Increases Student Retention by 40%",
    excerpt: "A deep dive into how LASU implemented NexFord Eduto improve student outcomes and administrative efficiency.",
    image: images.hero.campus,
    category: "Case Studies",
    author: {
      name: "Ngozi Adeyemi",
      avatar: images.testimonials.person4,
    },
    date: "Jan 20, 2026",
    readTime: "10 min read",
  },
  {
    id: "4",
    title: "New Feature: AI-Powered Plagiarism Detection",
    excerpt: "Introducing our latest feature that helps maintain academic integrity with advanced AI plagiarism detection.",
    image: images.technology.coding,
    category: "Product Updates",
    author: {
      name: "NexFord EduTeam",
      avatar: images.testimonials.person3,
    },
    date: "Jan 15, 2026",
    readTime: "3 min read",
  },
  // {
  //   id: "5",
  //   title: "Best Practices for Online Exam Proctoring",
  //   excerpt: "A comprehensive guide to setting up and managing secure online examinations with proctoring features.",
  //   image: images.features.exam,
  //   category: "Tips & Guides",
  //   author: {
  //     name: "Dr. Funke Adebayo",
  //     avatar: images.testimonials.person2,
  //   },
  //   date: "Jan 10, 2026",
  //   readTime: "7 min read",
  // },
  {
    id: "6",
    title: "How Covenant University Digitized Their Academic Operations",
    excerpt: "See how one of Nigeria's leading private universities transformed their processes with NexFord Edu.",
    image: images.cta.campus,
    category: "Case Studies",
    author: {
      name: "Michael Obi",
      avatar: images.testimonials.person1,
    },
    date: "Jan 5, 2026",
    readTime: "12 min read",
  },
  {
    id: "7",
    title: "The Rise of Hybrid Learning in Post-COVID Nigeria",
    excerpt: "Analyzing the shift towards hybrid learning models and how technology is enabling this transformation.",
    image: images.classroom.lecture,
    category: "EdTech Trends",
    author: {
      name: "Prof. Yemi Ogundimu",
      avatar: images.testimonials.person3,
    },
    date: "Dec 28, 2025",
    readTime: "6 min read",
  },
  {
    id: "8",
    title: "Getting Started: Your First Week with NexFord Edu",
    excerpt: "A step-by-step guide for new institutions on how to set up and configure NexFord Edufor maximum impact.",
    image: images.technology.dashboard,
    category: "Tips & Guides",
    author: {
      name: "NexFord EduTeam",
      avatar: images.testimonials.person4,
    },
    date: "Dec 20, 2025",
    readTime: "9 min read",
  },
];

function BlogCard({ post }: { post: BlogPost }) {
  const reducedMotion = useReducedMotion();

  const CardContent = (
    <motion.article
      variants={staggerItemVariants}
      className="group glass-premium overflow-hidden h-full flex flex-col"
    >
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
            {post.category}
          </Badge>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-grow">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <ImageWithFallback
              src={post.author.avatar}
              alt={post.author.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-sm text-muted-foreground">{post.author.name}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {post.readTime}
          </div>
        </div>
      </div>
    </motion.article>
  );

  return reducedMotion ? CardContent : <HoverCard>{CardContent}</HoverCard>;
}

function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <FadeIn>
      <article className="relative group glass-premium overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-0">
          <div className="relative h-64 lg:h-auto overflow-hidden">
            <ImageWithFallback
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute top-4 left-4">
              <Badge className="bg-primary text-primary-foreground">
                Featured
              </Badge>
            </div>
          </div>
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <Badge variant="outline" className="w-fit mb-4">
              {post.category}
            </Badge>
            <h2 className="text-2xl lg:text-3xl font-bold mb-4 group-hover:text-primary transition-colors">
              {post.title}
            </h2>
            <p className="text-muted-foreground mb-6">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <ImageWithFallback
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-sm">{post.author.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </div>
                </div>
              </div>
            </div>
            <Button className="w-fit group/btn">
              Read Article
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </div>
        </div>
      </article>
    </FadeIn>
  );
}

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const featuredPost = blogPosts.find((post) => post.featured);
  const regularPosts = blogPosts.filter((post) => !post.featured);

  const filteredPosts = regularPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 overflow-hidden gradient-bg">
          <div className="absolute inset-0 mesh-gradient opacity-50" aria-hidden="true" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <FadeIn>
              <span className="inline-block text-sm font-semibold text-primary mb-4 tracking-wider uppercase">
                Blog & Resources
              </span>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Insights for{" "}
                <span className="gradient-text">Modern Education</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Stay updated with the latest trends in educational technology,
                best practices, and success stories from institutions across Nigeria.
              </p>
            </FadeIn>

            {/* Search Bar */}
            <FadeIn delay={0.3}>
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg glass-card border-border/50"
                />
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-6 bg-secondary/50 border-b border-border sticky top-16 z-30 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {categories.map((category) => (
                <Button
                  key={category.name}
                  variant={activeCategory === category.name ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveCategory(category.name)}
                  className="gap-2"
                >
                  <category.icon className="h-4 w-4" />
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Post */}
        {featuredPost && activeCategory === "All" && !searchQuery && (
          <section className="py-12 lg:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <FeaturedPost post={featuredPost} />
            </div>
          </section>
        )}

        {/* Blog Grid */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {filteredPosts.length > 0 ? (
              <StaggerContainer
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                staggerDelay={0.08}
              >
                {filteredPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </StaggerContainer>
            ) : (
              <FadeIn>
                <div className="text-center py-16">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No articles found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search or filter to find what you're looking for.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveCategory("All");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </FadeIn>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-20 lg:py-32 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <FadeIn>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Stay in the Loop
                </h2>
              </FadeIn>
              <FadeIn delay={0.1}>
                <p className="text-lg text-muted-foreground mb-8">
                  Get the latest EdTech insights, product updates, and exclusive
                  content delivered straight to your inbox.
                </p>
              </FadeIn>
              <FadeIn delay={0.2}>
                <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="h-12 flex-grow"
                  />
                  <Button type="submit" size="lg" className="btn-glow">
                    Subscribe
                  </Button>
                </form>
              </FadeIn>
              <FadeIn delay={0.3}>
                <p className="text-sm text-muted-foreground mt-4">
                  Join 5,000+ educators. Unsubscribe anytime.
                </p>
              </FadeIn>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
