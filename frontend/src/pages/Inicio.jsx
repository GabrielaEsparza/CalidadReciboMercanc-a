import SideBar from '../components/SideBar';
//import Footer from '../components/Footer';
//import SeccionDestacada from '../components/SeccionDestacada';

function Inicio() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Llamas a los componentes ordenadamente */}
      
      
      <main className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Bienvenido al Sistema de Recibo</h1>
        {/* <SeccionDestacada /> */}
      </main>
    <SideBar />
      {/*<Footer />*/}
    </div>
  );
}

export default Inicio;
