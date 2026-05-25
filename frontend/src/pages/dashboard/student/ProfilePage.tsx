import { useState, useEffect } from 'react';
import { Save, Loader2, User as UserIcon, GraduationCap, Shield, Scan } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { studentNavItems } from '@/constants/studentNav';
import { useAccentColor } from '@/hooks/useAccentColor';
import { AccentColorPicker } from '@/components/dashboard/AccentColorPicker';
import { authService } from '@/services/auth.service';
import { FaceRegistrationCard } from '@/components/attendance/FaceRegistrationCard';

const navItems = studentNavItems;

export default function StudentProfilePage() {
  const { user } = useAuth();
  const { accentColor, updateAccentColor, defaultColor } = useAccentColor();

  const [profileData, setProfileData] = useState<{ user: any; profile: any } | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' });

  useEffect(() => { if (user) fetchProfile(); }, [user]);

  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await authService.getMe();
      const data = res.data?.data ?? res.data;
      setProfileData(data);
      setForm({
        firstName: data?.user?.firstName ?? '',
        lastName:  data?.user?.lastName  ?? '',
        phone:     data?.user?.phone     ?? '',
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
        firstName: form.firstName,
        lastName:  form.lastName,
        phone:     form.phone || undefined,
      });
      toast.success('Profile updated successfully!');
      // Refresh local profile data
      await fetchProfile();
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    }
    setSaving(false);
  }

  async function handlePasswordUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd        = new FormData(e.currentTarget);
    const current   = fd.get('current_password') as string;
    const newPw     = fd.get('new_password')      as string;
    const confirm   = fd.get('confirm_password')   as string;
    if (newPw !== confirm)  { toast.error('Passwords do not match');                return; }
    if (newPw.length < 8)   { toast.error('Password must be at least 8 characters'); return; }
    try {
      await authService.changePassword(current, newPw);
      toast.success('Password updated!');
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      toast.error(err.message || 'Password update failed');
    }
  }

  const u       = profileData?.user;
  const s       = profileData?.profile;
  const initials = `${u?.firstName?.[0] ?? ''}${u?.lastName?.[0] ?? ''}`.toUpperCase();
  const faceUrl  = s?.faceImageUrl ?? null;

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} roleLabel="Student Portal" accentColor="hsl(221, 83%, 53%)">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} roleLabel="Student Portal" accentColor="hsl(221, 83%, 53%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Profile & Settings</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold">Profile & Settings</h1>
          <p className="text-muted-foreground">Manage your account information and preferences</p>
        </div>

        {/* ── Avatar card ── */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-5">
              <Avatar className="w-20 h-20">
                {u?.profileImage && <AvatarImage src={u.profileImage} />}
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{u?.firstName} {u?.lastName}</h2>
                <p className="text-muted-foreground text-sm">{u?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  {s?.matricNumber && (
                    <Badge variant="outline" className="font-mono text-xs">{s.matricNumber}</Badge>
                  )}
                  {s?.department?.name && (
                    <Badge variant="secondary" className="text-xs">{s.department.name}</Badge>
                  )}
                  {s?.level && (
                    <Badge variant="secondary" className="text-xs">{s.level} Level</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Tabs ── */}
        <Tabs defaultValue="personal">
          <TabsList className="grid grid-cols-4 w-full sm:w-auto sm:inline-flex">
            <TabsTrigger value="personal" className="gap-1.5">
              <UserIcon className="h-3.5 w-3.5" /> Personal
            </TabsTrigger>
            <TabsTrigger value="academic" className="gap-1.5">
              <GraduationCap className="h-3.5 w-3.5" /> Academic
            </TabsTrigger>
            <TabsTrigger value="face" className="gap-1.5">
              <Scan className="h-3.5 w-3.5" /> Face ID
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-1.5">
              <Shield className="h-3.5 w-3.5" /> Security
            </TabsTrigger>
          </TabsList>

          {/* Personal Info */}
          <TabsContent value="personal" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your name and contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input
                      value={form.firstName}
                      onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                      placeholder="First name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input
                      value={form.lastName}
                      onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                      placeholder="Last name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={u?.email || ''} disabled className="opacity-60" />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+234..."
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving
                      ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      : <Save className="h-4 w-4 mr-2" />}
                    {saving ? 'Saving…' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Accent colour inside Personal tab */}
            <AccentColorPicker
              currentColor={accentColor}
              onColorChange={updateAccentColor}
              defaultColor={defaultColor}
            />
          </TabsContent>

          {/* Academic Info */}
          <TabsContent value="academic" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
                <CardDescription>Your enrollment details — read only</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Matric Number',  value: s?.matricNumber          },
                    { label: 'Department',      value: s?.department?.name      },
                    { label: 'School',          value: s?.school?.name          },
                    { label: 'Level',           value: s?.level ? `${s.level} Level` : undefined },
                    { label: 'Current Session', value: s?.currentSession        },
                    { label: 'Semester',        value: s?.currentSemester       },
                    { label: 'GPA',             value: s?.gpa?.toFixed(2)       },
                    { label: 'CGPA',            value: s?.cgpa?.toFixed(2)      },
                  ].map(item => (
                    <div key={item.label} className="space-y-2">
                      <Label>{item.label}</Label>
                      <Input value={item.value || '—'} disabled className="opacity-70" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Face ID */}
          <TabsContent value="face" className="mt-4">
            <FaceRegistrationCard
              faceImageUrl={faceUrl}
              onRegistered={url =>
                setProfileData(prev =>
                  prev ? { ...prev, profile: { ...prev.profile, faceImageUrl: url } } : prev
                )
              }
            />
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Use a strong password of at least 8 characters</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-sm">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" name="current_password" placeholder="Enter current password" required />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" name="new_password" placeholder="Enter new password" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input type="password" name="confirm_password" placeholder="Confirm new password" required />
                  </div>
                  <Button type="submit">
                    <Shield className="h-4 w-4 mr-2" /> Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}