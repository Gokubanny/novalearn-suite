import { useEffect, useState } from 'react';
import { FileText, Upload, Download, Loader2, Trash2, Eye, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useToast } from '@/hooks/use-toast';
import { materialService } from '@/services/material.service';

interface CourseMaterialsProps {
  courseId: string;
  courseName: string;
  canUpload: boolean;
}

interface Material {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  uploadedBy?: { firstName?: string; lastName?: string };
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getFileType(fileName: string): 'pdf' | 'image' | 'video' | 'document' | 'other' {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') return 'pdf';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return 'video';
  if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'].includes(ext)) return 'document';
  return 'other';
}

export function CourseMaterials({ courseId, courseName, canUpload }: CourseMaterialsProps) {
  const { toast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await materialService.list(courseId);
      const list: any[] = res.data?.data ?? [];
      setMaterials(list.map((m) => ({ ...m, id: m._id ?? m.id })));
    } catch (e: any) {
      toast({ title: 'Failed to load materials', description: e.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [courseId]);

  const handleUpload = async () => {
    if (!file || !title) {
      toast({ title: 'Title and file are required', variant: 'destructive' });
      return;
    }
    setBusy(true);
    try {
      await materialService.upload(courseId, file, title, description);
      toast({ title: 'Material uploaded' });
      setOpen(false); setTitle(''); setDescription(''); setFile(null);
      load();
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e.message, variant: 'destructive' });
    }
    setBusy(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this material?')) return;
    try {
      await materialService.remove(id);
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      if (previewMaterial?.id === id) setPreviewMaterial(null);
    } catch (e: any) {
      toast({ title: 'Delete failed', description: e.message, variant: 'destructive' });
    }
  };

  const renderPreview = () => {
    if (!previewMaterial) return null;

    const fileType = getFileType(previewMaterial.fileName);
    const isGoogleViewable = ['pdf', 'document'].includes(fileType);

    return (
      <Dialog open={!!previewMaterial} onOpenChange={() => setPreviewMaterial(null)}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-6">
              <span className="truncate">{previewMaterial.title}</span>
            </DialogTitle>
            <DialogDescription>
              {previewMaterial.description || 'No description provided'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 min-h-0 overflow-auto">
            {fileType === 'pdf' && (
              <iframe
                src={`${previewMaterial.fileUrl}#toolbar=0`}
                className="w-full h-[70vh] rounded-lg"
                title={previewMaterial.title}
              />
            )}
            
            {fileType === 'image' && (
              <div className="flex items-center justify-center p-4">
                <img
                  src={previewMaterial.fileUrl}
                  alt={previewMaterial.title}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              </div>
            )}
            
            {fileType === 'video' && (
              <video
                controls
                className="w-full max-h-[70vh] rounded-lg"
                src={previewMaterial.fileUrl}
              >
                Your browser does not support the video tag.
              </video>
            )}
            
            {fileType === 'document' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{previewMaterial.fileName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatSize(previewMaterial.fileSize)}
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="outline">
                    <a href={previewMaterial.fileUrl} download={previewMaterial.fileName}>
                      <Download className="h-4 w-4 mr-2" />
                      Download to view
                    </a>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  This file type cannot be previewed directly. Please download to view.
                </p>
              </div>
            )}
            
            {fileType === 'other' && (
              <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <FileText className="h-16 w-16 text-muted-foreground" />
                <p className="text-center text-muted-foreground">
                  This file type cannot be previewed.
                </p>
                <Button asChild variant="outline">
                  <a href={previewMaterial.fileUrl} download={previewMaterial.fileName}>
                    <Download className="h-4 w-4 mr-2" />
                    Download {previewMaterial.fileName}
                  </a>
                </Button>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewMaterial(null)}>
              Close
            </Button>
            <Button asChild variant="default">
              <a href={previewMaterial.fileUrl} download={previewMaterial.fileName}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>Course Materials</CardTitle>
            <CardDescription>{courseName}</CardDescription>
          </div>
          {canUpload && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2"><Upload className="h-4 w-4" /> Upload</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Material</DialogTitle>
                  <DialogDescription>Share documents, slides, or reading material.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label>Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div>
                    <Label>Description (optional)</Label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                  <div>
                    <Label>File</Label>
                    <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleUpload} disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    Upload
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : materials.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No materials yet"
              description={canUpload ? 'Upload the first material for this course.' : 'Your lecturer has not uploaded any materials yet.'}
            />
          ) : (
            <div className="space-y-2">
              {materials.map((m) => {
                const fileType = getFileType(m.fileName);
                const canPreview = ['pdf', 'image', 'video'].includes(fileType);
                
                return (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border bg-background hover:bg-muted/50 transition">
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{m.title}</p>
                      {m.description && <p className="text-xs text-muted-foreground truncate">{m.description}</p>}
                      <p className="text-xs text-muted-foreground">
                        {m.fileName} · {formatSize(m.fileSize)} · {new Date(m.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {canPreview && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPreviewMaterial(m)}
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button asChild size="sm" variant="outline" title="Download">
                        <a href={m.fileUrl} download={m.fileName}>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                      {canUpload && (
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(m.id)} title="Delete">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      {renderPreview()}
    </>
  );
}