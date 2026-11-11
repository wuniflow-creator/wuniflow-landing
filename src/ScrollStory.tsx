import {lazy, Suspense, useEffect, useRef, useState} from 'react';
const DimensionalWorkflowHero=lazy(()=>import('./components/ui/dimensional-workflow-hero'));
export default function ScrollStory(){
 const root=useRef<HTMLDivElement>(null);const [ready,setReady]=useState(false);
 useEffect(()=>{if(!('IntersectionObserver' in window)){setReady(true);return}const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setReady(true);observer.disconnect()}},{rootMargin:'700px'});if(root.current)observer.observe(root.current);return()=>observer.disconnect()},[]);
 return <div ref={root} style={{minHeight:700}}>{ready?<Suspense fallback={<div style={{minHeight:700}} aria-busy="true" aria-label="Carregando demonstração das soluções"/>}><DimensionalWorkflowHero/></Suspense>:<div style={{padding:'60px 24px',color:'#dbc4e5'}}><h2>Atendimento, automação e experiências digitais.</h2><p>Conheça como a Wuniflow conecta seu negócio.</p></div>}</div>;
}
