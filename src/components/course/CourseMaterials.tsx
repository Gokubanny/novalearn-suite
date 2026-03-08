import { useState, useEffect } from 'react';
import { FileText, Upload, Download, Loader2, File, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CourseMaterialsProps {
  courseId: string;
  courseName: string;
  canUpload: boolean;
}

interface Material {
  id: string;
  title: string;
  description: string | null;
  file_type: string | null;
  file_url: string | null;
  created_at: string | null;
  uploaded_by_name: string;
}

export function CourseMaterials({ courseId, courseName, canUpload }: CourseMaterialsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, [courseId]);

  const fetchMaterials = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('course_materials')
      .select('*, uploader:profiles!course_materials_uploaded_by_fkey(first_name, last_name)')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (data) {
      setMaterials(data.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        file_type: m.file_type,
        file_url: m.file_url,
        created_at: m.created_at,
        uploaded_by_name: (m.uploader as any)
          ? `${(m.uploader as any).first_name} ${(m.uploader as any).last_name}`
          : 'Unknown',
      })));
    }
    setLoading(false);
  };

  const handleUpload = async () => {
    if (!user || !title.trim()) return;
    setUploading(true);

    let fileUrl: string | null = null;
    let fileType: string | null = null;

    if (file) {
      fileType = file.name.split('.').pop()?.toLowerCase() || null;
      const filePath = `${courseId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('course-materials')
        .upload(filePath, file);

      if (uploadError) {
        toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('course-materials')
        .getPublicUrl(filePath);
      fileUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from('course_materials').insert({
      course_id: courseId,
      title: title.trim(),
      description: description.trim() || null,
      file_url: fileUrl,
      file_type: fileType,
      uploaded_by: user.id,
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Material uploaded!' });
      setTitle('');
      setDescription('');
      setFile(null);
      setDialogOpen(false);
      fetchMaterials();
    }
    setUploading(false);
  };

  const handleDownload = (url: string, name: string) => {
    window.open(url, '_blank');
  };

  const getFileIcon = (type: string | null) => {
    return <File className="h-5 w-5" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{courseName} — Materials</CardTitle>
            <CardDescription>{materials.length} file{materials.length !== 1 ? 's' : ''} available</CardDescription>
          </div>
          {canUpload && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button><Upload className="h-4 w-4 mr-2" /> Upload Material</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Course Material</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label>Title *</Label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Lecture 1 Slides" />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." />
                  </div>
                  <div>
                    <Label>File</Label>
                    <Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
                  </div>
                  <Button onClick={handleUpload} disabled={uploading || !title.trim()} className="w-full">
                    {uploading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Upload
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : materials.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No materials uploaded yet.</p>
        ) : (
          <div className="space-y-3">
            {materials.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {getFileIcon(m.file_type)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{m.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.uploaded_by_name} · {m.created_at ? new Date(m.created_at).toLocaleDateString() : ''}
                    </p>
                    {m.description && <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {m.file_type && <Badge variant="outline" className="uppercase text-xs">{m.file_type}</Badge>}
                  {m.file_url && (
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(m.file_url!, m.title)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
