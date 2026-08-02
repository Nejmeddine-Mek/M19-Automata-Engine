

function Header(){
    return(
        <>
            <div className="w-full h-[80px] bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shadow-md">
                <div className="flex items-center space-x-3">
                    {/* Optional Logo Placeholder */}
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-inner">
                        M
                    </div>
                    <h1 className="text-xl font-bold tracking-wide text-slate-100">
                        M19 Automata Simulator
                    </h1>
                </div>
            </div>
        </>
    )
}


export default Header