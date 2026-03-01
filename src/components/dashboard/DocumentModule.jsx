import React, { useState } from 'react';
import { useDocuments } from '../../hooks/useDocuments';
import { FileText, Upload, Folder, Search, Trash2, Download, Eye } from 'lucide-react';

const DocumentModule = ({ userId }) => {
    const { documents, loading, addDocument, deleteDocument } = useDocuments(userId);
    const [isUploading, setIsUploading] = useState(false);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        file: null
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, file: reader.result, name: file.name });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!formData.file) return;

        try {
            await addDocument(formData.name, formData.year, formData.month, formData.file);
            setIsUploading(false);
            setFormData({ name: '', year: new Date().getFullYear(), month: new Date().getMonth() + 1, file: null });
        } catch (error) {
            alert('Error al subir el documento');
        }
    };

    const years = [...new Set(documents.map(d => d.year))].sort((a, b) => b - a);
    const filteredDocs = documents.filter(d => d.year === Number(filterYear));

    const getMonthName = (m) => {
        return new Intl.DateTimeFormat('es', { month: 'long' }).format(new Date(2024, m - 1));
    };

    if (loading) return <div className="text-center py-10">Cargando documentos...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="text-blue-600" />
                        Mis Boletas y Winchas
                    </h2>
                    <p className="text-slate-500 text-sm">Respaldo online organizado por años</p>
                </div>
                <button
                    onClick={() => setIsUploading(!isUploading)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Upload className="w-5 h-5" />
                    Subir Boleta
                </button>
            </div>

            {isUploading && (
                <div className="glass-panel p-8 rounded-3xl border-2 border-primary-100 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-primary-600" />
                        Cargar Documento Electrónico
                    </h3>
                    <form onSubmit={handleUpload} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Archivo (PDF o Imagen)</label>
                                <input
                                    type="file"
                                    required
                                    onChange={handleFileChange}
                                    accept=".pdf,image/*"
                                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Año</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.year}
                                    onChange={e => setFormData({ ...formData, year: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-slate-200"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mes</label>
                                <select
                                    value={formData.month}
                                    onChange={e => setFormData({ ...formData, month: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-white"
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsUploading(false)}
                                className="px-6 py-2.5 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-2.5 rounded-xl bg-primary-700 text-white font-bold shadow-lg shadow-primary-900/20 hover:bg-primary-800 transition-all"
                            >
                                Confirmar Subida
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="flex items-center gap-4 bg-slate-100/50 p-2 rounded-2xl w-fit">
                <Search className="w-4 h-4 text-slate-400 ml-2" />
                <div className="flex gap-2">
                    {[new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2].map(year => (
                        <button
                            key={year}
                            onClick={() => setFilterYear(year)}
                            className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${filterYear === year ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {year}
                        </button>
                    ))}
                    {!years.includes(new Date().getFullYear()) &&
                        !years.includes(new Date().getFullYear() - 1) &&
                        !years.includes(new Date().getFullYear() - 2) &&
                        years.map(year => (
                            <button
                                key={year}
                                onClick={() => setFilterYear(year)}
                                className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${filterYear === year ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {year}
                            </button>
                        ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDocs.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <Folder className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">No hay boletas registradas para el año {filterYear}</p>
                    </div>
                ) : (
                    filteredDocs.map(doc => (
                        <div key={doc.id} className="glass-card p-5 rounded-3xl group hover:border-primary-200 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = doc.file;
                                            link.download = doc.name;
                                            link.click();
                                        }}
                                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                        title="Descargar"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteDocument(doc.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <h4 className="font-bold text-slate-800 text-sm truncate mb-1" title={doc.name}>{doc.name}</h4>
                            <p className="text-xs text-slate-400 font-medium uppercase">{getMonthName(doc.month)} {doc.year}</p>

                            <button
                                onClick={() => {
                                    const win = window.open();
                                    win.document.write(`<iframe src="${doc.file}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                                }}
                                className="mt-4 w-full py-2 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                            >
                                <Eye className="w-3.5 h-3.5" />
                                Vista Previa
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DocumentModule;
