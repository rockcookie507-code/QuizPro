import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { AspectRatio, ImageSize } from '../types';
import { Image, Wand2, Loader2, Upload, AlertCircle } from 'lucide-react';

type Tab = 'generate' | 'edit';

export const AIStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('generate');
  
  // Generation State
  const [genPrompt, setGenPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Edit State
  const [editPrompt, setEditPrompt] = useState('');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!genPrompt) return;
    setIsGenerating(true);
    setGenError(null);
    try {
      const result = await geminiService.generateImage(genPrompt, aspectRatio, imageSize);
      setGeneratedImage(result);
    } catch (e: any) {
      console.error(e);
      setGenError(e.message || "Failed to generate image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!sourceImage || !editPrompt) return;
    setIsEditing(true);
    setEditError(null);
    try {
      const result = await geminiService.editImage(sourceImage, editPrompt);
      setEditedImage(result);
    } catch (e: any) {
      console.error(e);
      setEditError(e.message || "Failed to edit image.");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-indigo-600" />
            AI Image Studio
          </h2>
          <p className="text-gray-500">Generate and edit assets using Gemini Pro & Flash models.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
              activeTab === 'generate' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Generate (Gemini 3 Pro)
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
              activeTab === 'edit' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Edit (Gemini 2.5 Flash)
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'generate' && (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Controls */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prompt</label>
                  <textarea
                    value={genPrompt}
                    onChange={(e) => setGenPrompt(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                    placeholder="Describe the image you want to create (e.g., 'A futuristic law office with holographic displays')..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                    <select 
                      value={imageSize}
                      onChange={(e) => setImageSize(e.target.value as ImageSize)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="1K">1K (Standard)</option>
                      <option value="2K">2K (High Res)</option>
                      <option value="4K">4K (Ultra Res)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Aspect Ratio</label>
                    <select 
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="1:1">1:1 (Square)</option>
                      <option value="16:9">16:9 (Landscape)</option>
                      <option value="9:16">9:16 (Portrait)</option>
                      <option value="4:3">4:3</option>
                      <option value="3:4">3:4</option>
                    </select>
                  </div>
                </div>

                {genError && (
                   <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 text-sm">
                     <AlertCircle className="w-5 h-5 flex-shrink-0" />
                     {genError}
                   </div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !genPrompt}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                  Generate Image
                </button>
                <p className="text-xs text-gray-500 text-center">Note: This model (Gemini 3 Pro) requires a paid API Key selection.</p>
              </div>

              {/* Preview */}
              <div className="bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center min-h-[400px] overflow-hidden">
                {generatedImage ? (
                  <img src={generatedImage} alt="Generated" className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <Image className="w-12 h-12 mb-2 opacity-50" />
                    <span className="text-sm">Preview will appear here</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'edit' && (
            <div className="grid md:grid-cols-2 gap-8">
               <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Source Image</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors text-center cursor-pointer relative">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload image</p>
                    </div>
                    {sourceImage && (
                       <div className="mt-4 h-32 w-32 rounded-lg border border-gray-200 overflow-hidden bg-gray-100 relative">
                         <img src={sourceImage} alt="Source" className="w-full h-full object-cover" />
                       </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Editing Instruction</label>
                    <textarea
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 h-24 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                      placeholder="e.g. 'Add a retro filter', 'Remove the person in the background'..."
                    />
                  </div>

                  {editError && (
                   <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 text-sm">
                     <AlertCircle className="w-5 h-5 flex-shrink-0" />
                     {editError}
                   </div>
                  )}

                  <button
                    onClick={handleEdit}
                    disabled={isEditing || !editPrompt || !sourceImage}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    {isEditing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                    Edit Image
                  </button>
               </div>

               <div className="bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center min-h-[400px] overflow-hidden">
                {editedImage ? (
                  <img src={editedImage} alt="Edited" className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <Image className="w-12 h-12 mb-2 opacity-50" />
                    <span className="text-sm">Edited result will appear here</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};