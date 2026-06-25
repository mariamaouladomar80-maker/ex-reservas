'use client'
 

import RoomCard from "@/components/RoomCard";
import listaSalas from "@/data/salas";
import { useState } from "react";

export default function Home() {
const [salas, setSalas] =  useState(listaSalas)


  return (
    <div className="p-23">
       {salas.map(c =>(
        <RoomCard key={c.id} sala={c} /> 
       )
       )}
       
    
      
    </div>
  );
}
