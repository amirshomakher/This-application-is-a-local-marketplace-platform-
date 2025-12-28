import React from 'react'
import { AlertTriangle, Trash2, Power, X } from 'lucide-react'

function Modal({ title, description, onConfirm, onCancel, type }) {

    React.useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [])

    const getIcon = () => {
        if (type === 'danger') {
            return <Trash2 class='w-8 h-8 text-red-400' />
        }

        return <AlertTriangle className='w-8 h-8 text-yellow-400' />
    }

    const getConfirmButtonColor = () => {
        if (type === 'danger') {
            return 'bg-red-600 hover:bg-red-700'
        }

        return 'bg-yellow-600 hover:bg-yellow-700'
    }


    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
        
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                onClick={onCancel}
            />


            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative transform overflow-hidden rounded-2xl bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 shadow-2xl transition-all w-full max-w-md">
                   
                    <div className="p-6 border-b border-slate-700/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {getIcon()}
                                <h3 className="text-xl font-bold text-white">{title}</h3>
                            </div>
                            <button
                                onClick={onCancel}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

         
                    <div className="p-6">
                        <p className="text-slate-300 mb-6">{description}</p>

                        <div className="flex gap-3">
                            <button
                                onClick={onCancel}
                                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-xl transition-all duration-300"
                            >
                                انصراف
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`flex-1 text-white font-medium py-3 rounded-xl transition-all duration-300 ${getConfirmButtonColor()}`}
                            >
                                {type === 'danger' ? 'حذف' : 'تایید'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Modal