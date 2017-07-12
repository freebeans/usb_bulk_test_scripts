// Configurações do programa /////////////////

let msg = 'freebeans';
let debug = false;


// Configurações do dispositivo /////////////

let PID = 0x0003;
let VID = 0x1cbe;

// Endereços dos endpoints
let  inEndpointAddress = 129; // Device -> PC
let outEndpointAddress = 1;   // PC -> Device

/////////////////////////////////////////////

// Importa a biblioteca
var usb = require('usb');

// Ativa debug de tudo
if(debug){
  usb.setDebugLevel(4);
}

// Busca dispositivo com PID:VID especificados
var device = usb.findByIds(VID, PID);

// Testa se o dispositivo está conectado e identificado corretamente
if(device){

  // Abre o dispositivo
  device.open();

  // Obtém a interface de ID=0 (única no dispositivo de interesse)
  var iface = device.interface(0);

  // Testa se a interface existe
  if(iface){

    // Obtém controle da interface
    iface.claim();

    // Obtém os endpoints à partir dos endereços configurados
    var inEndpoint  = iface.endpoint(inEndpointAddress);
    var outEndpoint = iface.endpoint(outEndpointAddress);

    // Se algum dos endpoints não tiver sido identificado, gera um erro
    if( !(inEndpoint && outEndpoint) ){
      errHandler("[USB] Erro: Não foi possível obter os endpoints");
    }


    // Envia a mensagem configurada no início do programa no endpoint OUT
    outEndpoint.transfer(msg, function (error) {
      if(error){
        console.error("[USB] Erro: Transferência outEndpoint");
        errHandler(error);
      }

      // Requisita dados no endpoint IN
      inEndpoint.transfer(512, function (error, data) {
        if(error){
          console.error("[USB] Erro: Transferência inEndpoint");
          errHandler(error);
        }
        console.log(String(data));
      });

      // Cria listener para evento sinistro no recebimento
      inEndpoint.on('error', function (error) {
        console.error("[USB] Erro: Evento inEndpoint");
        errHandler(error);
      });
    });

    // Cria listener para evento sinistro no envio
    outEndpoint.on('error', function (error) {
      console.error("[USB] Erro: Evento outEndpoint");
      errHandler(error);
    });

  }else{
    errHandler("[USB] Erro: Interface naão existe no dispositivo");
  }

}else{
  errHandler("[USB] Erro: Dispositivo não encontrado");
}

// Lida com o erro escrevendo na tela e fechando o programa
function errHandler(string) {
  console.error(string);
  process.exit(-1);
}
