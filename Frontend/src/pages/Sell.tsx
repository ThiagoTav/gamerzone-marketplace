import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Upload, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { productService } from "@/services/productService";
import { uploadService } from "@/services/uploadService";
import { resolveImageUrl } from "@/lib/api";
import { CATEGORIES } from "@/types/product";
import { useToast } from "@/hooks/use-toast";

const Sell = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState<"new" | "used">("new");
  const [images, setImages] = useState<string[]>([]);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!isEdit || !id) return;
    productService.getById(id).then((p) => {
      if (!p) return;
      setTitle(p.title);
      setCategory(p.category);
      setDescription(p.description);
      setPrice(String(p.price));
      setCondition(p.condition);
      setImages(p.images);
      setSpecs(Object.entries(p.specs).map(([k, v]) => ({ key: k, value: v })));
    });
  }, [id, isEdit]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    setUploading(true);
    try {
      const urls = await uploadService.uploadImages(files);
      setImages((prev) => [...prev, ...urls]);
    } catch (err) {
      const message = err instanceof Error ? err.message : undefined;
      toast({ title: "Erro ao enviar imagem", description: message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (images.length === 0) {
      toast({ title: "Adicione ao menos 1 imagem", variant: "destructive" });
      return;
    }
    setLoading(true);
    const specsObj: Record<string, string> = {};
    specs.forEach((s) => { if (s.key && s.value) specsObj[s.key] = s.value; });
    const data = {
      title, category, description, price: Number(price), condition, images, specs: specsObj,
    };
    try {
      if (isEdit && id) {
        await productService.update(id, data);
        toast({ title: "Anúncio atualizado!" });
      } else {
        await productService.create(data);
        toast({ title: "Anúncio publicado!" });
      }
      navigate("/my-listings");
    } catch (err) {
      const message = err instanceof Error ? err.message : undefined;
      toast({ title: "Erro", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <h1 className="text-4xl font-bold mb-8">
          {isEdit ? "Editar" : "Vender um"} <span className="text-primary">Produto</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-gradient-card border-border">
            <CardHeader><CardTitle>Informações</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Título</Label><Input required value={title} onChange={(e) => setTitle(e.target.value)} /></div>
              <div>
                <Label>Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Descrição</Label>
                <Textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Preço (R$)</Label>
                  <Input required type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
                <div>
                  <Label>Condição</Label>
                  <RadioGroup value={condition} onValueChange={(v) => setCondition(v as any)} className="flex gap-4 h-10 items-center">
                    <div className="flex items-center gap-2"><RadioGroupItem value="new" id="c-new" /><Label htmlFor="c-new">Novo</Label></div>
                    <div className="flex items-center gap-2"><RadioGroupItem value="used" id="c-used" /><Label htmlFor="c-used">Usado</Label></div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border">
            <CardHeader><CardTitle>Imagens</CardTitle></CardHeader>
            <CardContent>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-primary transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  {uploading ? "Enviando..." : "Clique para adicionar imagens"}
                </span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleFile} disabled={uploading} />
              </label>
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {images.map((img, i) => (
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                      <img src={resolveImageUrl(img)} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border">
            <CardHeader><CardTitle>Características técnicas</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {specs.map((s, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <Input placeholder="Ex: DPI" value={s.key} onChange={(e) => {
                    const copy = [...specs]; copy[i].key = e.target.value; setSpecs(copy);
                  }} />
                  <Input placeholder="Ex: 16000" value={s.value} onChange={(e) => {
                    const copy = [...specs]; copy[i].value = e.target.value; setSpecs(copy);
                  }} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => setSpecs(specs.filter((_, idx) => idx !== i))}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => setSpecs([...specs, { key: "", value: "" }])}>
                + Adicionar característica
              </Button>
            </CardContent>
          </Card>

          <Button type="submit" disabled={loading || uploading}
            className="w-full bg-gradient-gamer hover:opacity-90 h-12 shadow-glow-primary text-lg">
            {loading ? "Salvando..." : isEdit ? "Salvar alterações" : "Publicar anúncio"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Sell;
