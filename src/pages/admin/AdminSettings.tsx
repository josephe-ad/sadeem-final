import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from 'sonner';
import type { SiteSettings } from '@/types';

export default function AdminSettings() {
  const { settings, fetchSettings } = useSettingsStore();
  const { register, handleSubmit, reset } = useForm<SiteSettings>();
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    if (settings) reset(settings);
  }, [settings, reset]);

  const onSubmit = async (data: SiteSettings) => {
    setSaving(true);
    try {
      let logoUrl = data.logo_url;
      if (logoFile) {
        const path = `logo-${Date.now()}-${logoFile.name}`;
        const { error: upErr } = await supabase.storage.from('brand-assets').upload(path, logoFile, { upsert: true });
        if (upErr) throw upErr;
        logoUrl = supabase.storage.from('brand-assets').getPublicUrl(path).data.publicUrl;
      }

      const payload = { ...data, logo_url: logoUrl, shipping_price: Number(data.shipping_price) };
      const { error } = settings?.id
        ? await supabase.from('site_settings').update(payload).eq('id', settings.id)
        : await supabase.from('site_settings').insert(payload);
      if (error) throw error;
      toast.success('Settings saved');
      fetchSettings();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl mb-8">Website Settings</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 glass rounded-2xl p-8">
        <div>
          <label className="block text-sm text-white/60 mb-1">Hero Title</label>
          <input {...register('hero_title')} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3" />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1">Hero Subtitle</label>
          <input {...register('hero_subtitle')} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3" />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1">Logo</label>
          <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">WhatsApp Number</label>
            <input {...register('whatsapp_number')} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3" />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Shipping Price</label>
            <input type="number" step="0.01" {...register('shipping_price')} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1">Currency</label>
          <input {...register('currency')} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">Instagram URL</label>
            <input {...register('social_instagram')} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3" />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">TikTok URL</label>
            <input {...register('social_tiktok')} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1">SEO Title</label>
          <input {...register('seo_title')} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3" />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1">SEO Description</label>
          <textarea {...register('seo_description')} rows={3} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3" />
        </div>
        <button type="submit" disabled={saving} className="w-full bg-sadeem-gold text-black py-3 rounded-full font-medium disabled:opacity-50">
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
