import Boton from "./Boton";
 
export default function RoomCard({sala}){
    return(
        <div className=" fmax-w-sm mx-auto mt-10">
            <div className="bg-white shadow-lg rounded-2xl p-5 flex items-center justify-between ">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">{sala.nombre} </h2>
                      <h2 className="text-lg font-semibold text-gray-800">{sala.precio} </h2>
                         <div >
                  <img
                    src={sala.imagen}
                    alt={sala.nombre}
                    className="w-full "
                  />
                </div>
                </div>
                <Boton />
            </div>
        </div>
    )
}