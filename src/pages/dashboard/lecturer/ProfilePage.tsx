import { useState, useEffect, useRef } from 'react';
import { Home, BookOpen, Users, FileText, BarChart3, Calendar, CheckCircle, Camera, Save, User, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useAccentColor } from '@/hooks/useAccentColor';
import { AccentColorPicker } from '@/components/dashboard/AccentColorPicker';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/lecturer', icon: Home },
  { name: 'My Courses', href: '/dashboard/lecturer/courses', icon: BookOpen },
  { name: 'Attendance', href: '/dashboard/lecturer/attendance', icon: CheckCircle },
  { name: 'Assignments', href: '/dashboard/lecturer/assignments', icon: FileText },
  { name: 'Results', href: '/dashboard/lecturer/results', icon: BarChart3 },
  { name: 'Students', href: '/dashboard/lecturer/students', icon: Users },
  { name: 'Schedule', href: '/dashboard/lecturer/schedule', icon: Calendar },
  { name: 'Profile', href: '/dashboard/lecturer/profile', icon: User },
];

export default function LecturerProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', bio: '' });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (user) fetchProfile(); }, [user]);

  async function fetchProfile() {
    const { data } = await supabase.from('profiles').select('*').eq('user_id', user!.id).single();
    if (data) {
      setProfile(data);
      setForm({ first_name: data.first_name, last_name: data.last_name, phone: data.phone || '', bio: data.bio || '' });
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      first_name: form.first_name, last_name: form.last_name,
      phone: form.phone || null, bio: form.bio || null,
    }).eq('id', profile.id);
    if (error) toast.error(error.message);
    else toast.success('Profile updated!');
    setSaving(false);
  }

  async function handleAvatar() {
    const file = fileRef.current?.files?.[0];
    if (!file || !profile) return;
    const path = `${user!.id}/${Date.now()}_${file.name}`;
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (upErr) { toast.error(upErr.message); return; }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
    setProfile({ ...profile, avatar_url: publicUrl });
    toast.success('Avatar updated!');
  }

  async function handlePasswordUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newPw = fd.get('new_password') as string;
    const confirm = fd.get('confirm_password') as string;
    if (newPw !== confirm) { toast.error('Passwords do not match'); return; }
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) toast.error(error.message);
    else { toast.success('Password updated!'); e.currentTarget.reset(); }
  }

  const initials = profile ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}` : '';

  if (loading) return (
    <DashboardLayout navItems={navItems} roleLabel="Lecturer Portal" accentColor="hsl(142, 70%, 45%)">
      <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout navItems={navItems} roleLabel="Lecturer Portal" accentColor="hsl(142, 70%, 45%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Profile & Settings</span>
        </div>
        <div><h1 className="text-2xl font-bold">Profile & Settings</h1><p className="text-muted-foreground">Manage your account information</p></div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">{initials}</AvatarFallback>
                </Avatar>
                <Button size="icon" variant="outline" className="absolute -bottom-1 -right-1 rounded-full w-7 h-7"
                  onClick={() => fileRef.current?.click()}>
                  <Camera className="h-3 w-3" />
                </Button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{profile?.first_name} {profile?.last_name}</h2>
                <p className="text-muted-foreground">{profile?.staff_id || ''} • {profile?.department || ''}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="personal">
          <TabsList>
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="mt-4">
            <Card>
              <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>First Name</Label><Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Last Name</Label><Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Email</Label><Input value={profile?.email || ''} disabled /></div>
                  <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                </div>
                <div className="space-y-2"><Label>Bio</Label><Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} /></div>
                <Button onClick={handleSave} disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? 'Saving...' : 'Save Changes'}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academic" className="mt-4">
            <Card>
              <CardHeader><CardTitle>Academic Information</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Staff ID</Label><Input value={profile?.staff_id || '—'} disabled /></div>
                  <div className="space-y-2"><Label>Department</Label><Input value={profile?.department || '—'} disabled /></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-4">
            <Card>
              <CardHeader><CardTitle>Security Settings</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div className="space-y-2"><Label>New Password</Label><Input type="password" name="new_password" placeholder="Enter new password" required /></div>
                  <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" name="confirm_password" placeholder="Confirm new password" required /></div>
                  <Button type="submit">Update Password</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
