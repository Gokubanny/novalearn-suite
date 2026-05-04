import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { studentNavItems } from '@/constants/studentNav';
import { useAccentColor } from '@/hooks/useAccentColor';
import { AccentColorPicker } from '@/components/dashboard/AccentColorPicker';
import { authService } from '@/services/auth.service';

const navItems = studentNavItems;

export default function StudentProfilePage() {
  const { user } = useAuth();
  const { accentColor, updateAccentColor, defaultColor } = useAccentColor();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', bio: '' });

  useEffect(() => { if (user) fetchProfile(); }, [user]);

  async function fetchProfile() {
    try {
      const res = await authService.getMe();
      const data = res.data?.data ?? res.data;
      setProfile(data);
      setForm({
        first_name: data.firstName ?? '',
        last_name: data.lastName ?? '',
        phone: data.phone ?? '',
        bio: data.bio ?? '',
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to load profile');
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await authService.updateProfile({
        firstName: form.first_name,
        lastName: form.last_name,
        phone: form.phone || undefined,
      });
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    }
    setSaving(false);
  }

  async function handlePasswordUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const currentPw = fd.get('current_password') as string;
    const newPw = fd.get('new_password') as string;
    const confirm = fd.get('confirm_password') as string;
    if (newPw !== confirm) { toast.error('Passwords do not match'); return; }
    if (newPw.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    try {
      await authService.changePassword(currentPw, newPw);
      toast.success('Password updated!');
      e.currentTarget.reset();
    } catch (err: any) {
      toast.error(err.message || 'Password update failed');
    }
  }

  const initials = profile ? `${(profile.firstName ?? '')[0] ?? ''}${(profile.lastName ?? '')[0] ?? ''}` : '';
  const matric = profile?.matricNumber ?? profile?.student?.matricNumber ?? '';
  const dept = profile?.department?.name ?? profile?.department ?? '';

  if (loading) return (
    <DashboardLayout navItems={navItems} roleLabel="Student Portal" accentColor="hsl(221, 83%, 53%)">
      <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout navItems={navItems} roleLabel="Student Portal" accentColor="hsl(221, 83%, 53%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Profile & Settings</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Profile & Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20">
                {profile?.profileImage && <AvatarImage src={profile.profileImage} />}
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{profile?.firstName} {profile?.lastName}</h2>
                <p className="text-muted-foreground">{matric} {dept ? `• ${dept}` : ''}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="personal">
          <TabsList>
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="academic">Academic Info</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="mt-4">
            <Card>
              <CardHeader><CardTitle>Personal Information</CardTitle><CardDescription>Update your personal details</CardDescription></CardHeader>
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
              <CardHeader><CardTitle>Academic Information</CardTitle><CardDescription>Your enrollment details (read-only)</CardDescription></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Matric Number</Label><Input value={matric || '—'} disabled /></div>
                  <div className="space-y-2"><Label>Department</Label><Input value={dept || '—'} disabled /></div>
                  <div className="space-y-2"><Label>Email</Label><Input value={profile?.email || ''} disabled /></div>
                  <div className="space-y-2"><Label>School</Label><Input value={profile?.school?.name || profile?.school || '—'} disabled /></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-4">
            <Card>
              <CardHeader><CardTitle>Security Settings</CardTitle><CardDescription>Change your password</CardDescription></CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div className="space-y-2"><Label>Current Password</Label><Input type="password" name="current_password" placeholder="Enter current password" required /></div>
                  <div className="space-y-2"><Label>New Password</Label><Input type="password" name="new_password" placeholder="Enter new password" required /></div>
                  <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" name="confirm_password" placeholder="Confirm new password" required /></div>
                  <Button type="submit">Update Password</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <AccentColorPicker currentColor={accentColor} onColorChange={updateAccentColor} defaultColor={defaultColor} />
      </div>
    </DashboardLayout>
  );
}
