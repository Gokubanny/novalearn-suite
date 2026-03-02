import { 
  Home, Building2, Users, DollarSign, FileText, Newspaper, Tag, Settings,
  Search, PlusCircle, MoreHorizontal, Eye, Edit, Trash2, Calendar
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/super-admin', icon: Home },
  { name: 'Schools', href: '/dashboard/super-admin/institutions', icon: Building2 },
  { name: 'Revenue', href: '/dashboard/super-admin/revenue', icon: DollarSign },
  { name: 'Users', href: '/dashboard/super-admin/users', icon: Users },
  { name: 'Audit Log', href: '/dashboard/super-admin/audit', icon: FileText },
  { name: 'Blog', href: '/dashboard/super-admin/blog', icon: Newspaper },
  { name: 'Pricing', href: '/dashboard/super-admin/pricing', icon: Tag },
  { name: 'Settings', href: '/dashboard/super-admin/settings', icon: Settings },
];

const blogPosts = [
  { id: 1, title: 'How AI is Transforming African Education', status: 'published', author: 'NexfordEdu Team', date: 'Mar 1, 2024', views: 1250, category: 'AI & Technology' },
  { id: 2, title: 'Best Practices for Online Exam Proctoring', status: 'published', author: 'Dr. Adebayo', date: 'Feb 25, 2024', views: 890, category: 'Assessment' },
  { id: 3, title: '2024 EdTech Trends in Nigeria', status: 'draft', author: 'NexfordEdu Team', date: 'Feb 20, 2024', views: 0, category: 'Industry' },
  { id: 4, title: 'Student Engagement Strategies', status: 'published', author: 'Prof. Okonkwo', date: 'Feb 15, 2024', views: 2100, category: 'Teaching' },
  { id: 5, title: 'Data Privacy in Educational Platforms', status: 'review', author: 'Legal Team', date: 'Feb 10, 2024', views: 0, category: 'Security' },
];

export default function BlogManagementPage() {
  return (
    <DashboardLayout navItems={navItems} roleLabel="Super Admin" accentColor="hsl(0, 84%, 60%)">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Blog Management</h1>
            <p className="text-muted-foreground">Create and manage blog posts</p>
          </div>
          <Button><PlusCircle className="h-4 w-4 mr-2" />New Post</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{blogPosts.length}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{blogPosts.filter(p => p.status === 'published').length}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{blogPosts.filter(p => p.status === 'draft').length}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{blogPosts.reduce((a, p) => a + p.views, 0).toLocaleString()}</div></CardContent></Card>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search blog posts..." className="pl-9" />
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {blogPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{post.title}</p>
                      <Badge variant={post.status === 'published' ? 'default' : post.status === 'draft' ? 'secondary' : 'outline'}>
                        {post.status}
                      </Badge>
                      <Badge variant="outline">{post.category}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span>{post.author}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{post.date}</span>
                      {post.views > 0 && <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views.toLocaleString()} views</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="outline" size="sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />Preview</DropdownMenuItem>
                        <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                        {post.status === 'draft' && <DropdownMenuItem>Publish</DropdownMenuItem>}
                        {post.status === 'published' && <DropdownMenuItem>Unpublish</DropdownMenuItem>}
                        <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
