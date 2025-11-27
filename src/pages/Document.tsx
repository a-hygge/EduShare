import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Download, Eye, FileText, Calendar, User, Video, Music, Trash2 } from "lucide-react";
import Header from "@/components/Layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth-new";
import { documentsAPI } from "@/lib/api";

// Lazy load WebViewer
const WebViewerComponent = lazy(() => import("@/components/WebViewer/WebViewerComponent"));

const Document = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [documentData, setDocumentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [useWebViewer, setUseWebViewer] = useState(true);

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const loadDocument = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await documentsAPI.getById(id);
        setDocumentData(response.data);
      } catch (error) {
        console.error('Error loading document:', error);
        toast({
          title: "Lỗi",
          description: "Không thể tải tài liệu",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [id, toast]);

  const handleDownload = async () => {
    if (!documentData?.file_path) return;
    
    try {
      if (id) {
        await documentsAPI.download(id);
      }
      
      // Download file from server
      const fileUrl = `http://localhost:3000${documentData.file_path}`;
      window.location.href = fileUrl;
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải xuống tài liệu",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!id || !documentData) return;
    
    if (!user || user.role !== 'teacher' || documentData.uploaded_by !== user.id) {
      toast({
        title: "Không có quyền",
        description: "Chỉ giáo viên có thể xóa tài liệu của mình",
        variant: "destructive"
      });
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa tài liệu "${documentData.title}"?`)) {
      return;
    }

    try {
      await documentsAPI.delete(id);
      toast({
        title: "Thành công",
        description: "Đã xóa tài liệu"
      });
      navigate('/');
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa tài liệu",
        variant: "destructive"
      });
    }
  };

  const getFileType = () => {
    if (!documentData?.file_type) return 'unknown';
    
    const mimeType = documentData.file_type.toLowerCase();
    const filePath = documentData.file_path?.toLowerCase() || '';
    
    // Video
    if (mimeType.includes('video')) return 'video';
    
    // Audio
    if (mimeType.includes('audio')) return 'audio';
    
    // PDF
    if (mimeType.includes('pdf') || filePath.endsWith('.pdf')) return 'pdf';
    
    // Image
    if (mimeType.includes('image')) return 'image';
    
    // Text
    if (mimeType.includes('text/plain') || filePath.endsWith('.txt')) return 'text';
    
    // Office Documents
    if (mimeType.includes('word') || 
        mimeType.includes('document') || 
        filePath.endsWith('.doc') || 
        filePath.endsWith('.docx')) return 'word';
    
    // Office Presentations
    if (mimeType.includes('presentation') || 
        mimeType.includes('powerpoint') ||
        filePath.endsWith('.ppt') || 
        filePath.endsWith('.pptx')) return 'powerpoint';
    
    // Office Spreadsheets
    if (mimeType.includes('spreadsheet') || 
        mimeType.includes('excel') ||
        filePath.endsWith('.xls') || 
        filePath.endsWith('.xlsx') ||
        filePath.endsWith('.csv')) return 'excel';
    
    return 'other';
  };

  const renderPreview = () => {
    const fileType = getFileType();
    const fileUrl = `http://localhost:3000${documentData.file_path}`;
    const encodedUrl = encodeURIComponent(fileUrl);
    const fileName = documentData.file_path?.split('/').pop() || 'document';

    // Convert TXT to PDF before preview
    if (fileType === 'text') {
      const convertedUrl = `http://localhost:3000/api/convert/txt-to-pdf?filePath=${encodeURIComponent(documentData.file_path)}`;
      return (
        <Suspense fallback={
          <div className="w-full h-[700px] rounded-lg border bg-muted flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Đang chuyển đổi TXT sang PDF...</p>
            </div>
          </div>
        }>
          <WebViewerComponent fileUrl={convertedUrl} fileName={fileName.replace('.txt', '.pdf')} />
        </Suspense>
      );
    }

    // Use WebViewer for all document types (universal viewer)
    if (useWebViewer && fileType !== 'video' && fileType !== 'audio') {
      return (
        <Suspense fallback={
          <div className="w-full h-[700px] rounded-lg border bg-muted flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Đang tải WebViewer...</p>
            </div>
          </div>
        }>
          <WebViewerComponent fileUrl={fileUrl} fileName={fileName} />
        </Suspense>
      );
    }
    
    switch (fileType) {
      case 'video':
        return (
          <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
            <video 
              controls 
              className="w-full h-full"
              preload="metadata"
            >
              <source src={fileUrl} type={documentData.file_type} />
              Trình duyệt của bạn không hỗ trợ phát video.
            </video>
          </div>
        );
      
      case 'audio':
        return (
          <div className="w-full p-8 bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-lg">
            <div className="flex flex-col items-center space-y-4">
              <Music className="h-16 w-16 text-primary" />
              <audio 
                controls 
                className="w-full max-w-md"
                preload="metadata"
              >
                <source src={fileUrl} type={documentData.file_type} />
                Trình duyệt của bạn không hỗ trợ phát audio.
              </audio>
            </div>
          </div>
        );
      
      case 'pdf':
        return (
          <div className="w-full h-[700px] rounded-lg overflow-hidden border bg-gray-100">
            <iframe
              src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodedUrl}`}
              className="w-full h-full"
              title="PDF Preview"
            />
          </div>
        );
      
      case 'image':
        return (
          <div className="w-full rounded-lg overflow-hidden">
            <img 
              src={fileUrl} 
              alt={documentData.title}
              className="w-full h-auto object-contain max-h-[600px]"
            />
          </div>
        );
      
      case 'word':
      case 'powerpoint':
      case 'excel':
        return (
          <div className="w-full space-y-4">
            <div className="w-full h-[700px] rounded-lg overflow-hidden border bg-white">
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`}
                className="w-full h-full"
                title="Office Document Preview"
                onError={(e) => {
                  console.error('Office viewer failed to load');
                }}
              />
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Microsoft Office Viewer</span>
              </div>
              <span>•</span>
              <button
                onClick={handleDownload}
                className="text-primary hover:underline flex items-center gap-1"
              >
                <Download className="h-3 w-3" />
                Tải xuống nếu không hiển thị
              </button>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="bg-muted rounded-lg p-8 text-center space-y-4">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <div>
              <p className="text-muted-foreground mb-4">
                Không thể xem trước định dạng file này với viewer cơ bản.
              </p>
              <Button onClick={() => setUseWebViewer(true)} variant="outline">
                Thử WebViewer (Hỗ trợ mọi loại file)
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Hoặc tải xuống để xem tài liệu.
            </p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onMenuToggle={handleMenuToggle} />
        <main className="pt-4">
          <div className="container px-4 pb-8">
            <Card>
              <CardContent className="p-8 text-center">
                <p>Đang tải...</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (!documentData) {
    return (
      <div className="min-h-screen bg-background">
        <Header onMenuToggle={handleMenuToggle} />
        <main className="pt-4">
          <div className="container px-4 pb-8">
            <Card>
              <CardContent className="p-8 text-center">
                <p>Không tìm thấy tài liệu</p>
                <Button onClick={() => navigate('/')} className="mt-4">
                  Về trang chủ
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={handleMenuToggle} />
      
      <main className="pt-4">
        <div className="container px-4 pb-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{documentData.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      {documentData.subject_name && (
                        <Badge variant="secondary">{documentData.subject_name}</Badge>
                      )}
                      {documentData.document_type && (
                        <Badge variant="outline">{documentData.document_type}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{documentData.uploader_name || 'Không rõ'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(documentData.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span>{documentData.views_count || 0} lượt xem</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-muted-foreground" />
                      <span>{documentData.downloads_count || 0} lượt tải</span>
                    </div>
                  </div>
                  {documentData.description && (
                    <div className="pt-4 border-t">
                      <h3 className="font-semibold mb-2">Mô tả</h3>
                      <p className="text-muted-foreground">{documentData.description}</p>
                    </div>
                  )}
                  <div className="pt-4 border-t flex gap-2">
                    <Button onClick={handleDownload} className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Tải xuống
                    </Button>
                    {user && user.role === 'teacher' && documentData.uploaded_by === user.id && (
                      <Button onClick={handleDelete} variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => navigate('/')}>
                      Quay lại
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getFileType() === 'video' && <Video className="h-5 w-5" />}
                  {getFileType() === 'audio' && <Music className="h-5 w-5" />}
                  {getFileType() !== 'video' && getFileType() !== 'audio' && <FileText className="h-5 w-5" />}
                  Xem trước tài liệu
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderPreview()}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Document;
