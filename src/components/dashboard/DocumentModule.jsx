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

    const [uploadSuccess, setUploadSuccess] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) {
                alert('El archivo es demasiado grande (>1MB). Por favor, intenta con un archivo más ligero.');
                e.target.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, file: reader.result, name: file.name });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!formData.file) {
            alert('Por favor selecciona un archivo primero');
            return;
        }

        try {
            await addDocument(formData.name, formData.year, formData.month, formData.file);
            setUploadSuccess(true);

            // Limpiar formulario y cerrar tras breve delay de éxito
            setTimeout(() => {
                setIsUploading(false);
                setUploadSuccess(false);
                setFormData({ name: '', year: new Date().getFullYear(), month: new Date().getMonth() + 1, file: null });
            }, 1500);

        } catch (error) {
            console.error("Upload error details:", error);
            alert(`Error al subir el documento: ${error.message || 'Error desconocido'}.`);
        }
    };

    const years = [...new Set(documents.map(d => d.year))].sort((a, b) => b - a);
    const filteredDocs = documents.filter(d => d.year === Number(filterYear));

    const getMonthName = (m) => {
        return new Intl.DateTimeFormat('es', { month: 'long' }).format(new Date(2024, m - 1));
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">Cargando tus boletas...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="text-primary-600" />
                        Mis Boletas y Winchas
                    </h2>
                    <p className="text-slate-500 text-sm">Respaldo online organizado por años</p>
                </div>
                {!isUploading && (
                    <button
                        onClick={() => setIsUploading(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Upload className="w-5 h-5" />
                        Subir Boleta
                    </button>
                )}
            </div>

            {isUploading && (
                <div className="glass-panel p-8 rounded-[32px] border-2 border-primary-100 shadow-xl shadow-primary-900/5 animate-in zoom-in-95 duration-300">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                <Upload className="w-6 h-6 text-primary-600" />
                                {uploadSuccess ? '¡Archivo Cargado!' : 'Cargar Documento Electrónico'}
                            </h3>
                            <p className="text-slate-500 text-sm mt-1">Selecciona el archivo y el periodo correspondiente.</p>
                        </div>
                        {!uploadSuccess && (
                            <button onClick={() => setIsUploading(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                                <Trash2 className="w-5 h-5 text-slate-400" />
                            </button>
                        )}
                    </div>

                    {uploadSuccess ? (
                        <div className="py-10 text-center animate-in fade-in zoom-in">
                            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-800">Carga completada con éxito</h4>
                            <p className="text-slate-500">Tu documento ya está disponible en tu biblioteca.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleUpload} className="space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Zona de archivo estilizada */}
                                <div className="lg:col-span-12">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Archivo (PDF o Imagen)</label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            required
                                            onChange={handleFileChange}
                                            accept=".pdf,image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className={`p-10 border-2 border-dashed rounded-[24px] transition-all flex flex-col items-center justify-center gap-4 ${formData.file ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-slate-50 group-hover:border-primary-300 group-hover:bg-primary-50/30'}`}>
                                            <div className={`p-4 rounded-2xl ${formData.file ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 shadow-sm'}`}>
                                                <FileText className="w-8 h-8" />
                                            </div>
                                            <div className="text-center">
                                                <p className={`font-bold ${formData.file ? 'text-emerald-700' : 'text-slate-600'}`}>
                                                    {formData.file ? formData.name : 'Haz clic para seleccionar o arrastra'}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">Máximo 1MB · PDF, JPG, PNG</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-6">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Año del documento</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.year}
                                        onChange={e => setFormData({ ...formData, year: e.target.value })}
                                        className="w-full p-4 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary-500/20 transition-all font-bold text-slate-700"
                                    />
                                </div>

                                <div className="lg:col-span-6">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Mes correspondiente</label>
                                    <select
                                        value={formData.month}
                                        onChange={e => setFormData({ ...formData, month: e.target.value })}
                                        className="w-full p-4 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary-500/20 transition-all font-bold text-slate-700 appearance-none"
                                    >
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 items-center">
                                <button
                                    type="button"
                                    onClick={() => setIsUploading(false)}
                                    className="px-8 py-4 rounded-2xl text-slate-500 font-bold hover:bg-slate-100 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={!formData.file}
                                    className="px-10 py-4 rounded-2xl bg-primary-700 text-white font-black shadow-xl shadow-primary-900/20 hover:bg-primary-800 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Confirmar Subida
                                </button>
                            </div>
                        </form>
                    )}
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
