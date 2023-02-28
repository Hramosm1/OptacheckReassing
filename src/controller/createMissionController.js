'use strict'
const sleep = require('util').promisify(setTimeout);
const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();
const request = require("request");
const https = require("https");
const schedule = require('node-schedule')

let json;

//ENVIO DE JSON A LOAD PROCESS DARA
async function load_process_data (content,id){
    // let params = req.body;
    let jsonOrigin = content;
    let workspace_Id = id

    try{
        const request = await prisma.$queryRawUnsafe(`execute load_process_JSON_Optacheck '${jsonOrigin}','${workspace_Id}'`);    
        if (request !== []) {
            return true
        } else {
            console.log('No se ha podido obtener alguna respuesta de la base de datos');
        }
    }catch(err){
        console.log("Error en el servidor || "+err);
    }
}
//CREACION DE REASSING MISSIONS
async function create_missions(AddressId,ClientName,Form,AccountNumber,Description,AddressType,AgentEmail,Url,WorkspaceKey,Endpoint,LoggedAccessToken,UserAccessToken){
        try{
            request.post({
                headers: {
                    "Authorization": 'Token '+LoggedAccessToken,
                    "Cache-Control": "no-cache",
                    "Content-Type": "application/json",
                    "x-api-key": UserAccessToken,
                },
                url: Url+WorkspaceKey+'/'+Endpoint,
                body: JSON.stringify({
                    status: "assigned",
                    title: AddressId.toString(),
                    description: ClientName,
                    form:Form,
                    project: null,
                    client: null,
                    data: {
                        fields: [
                            {
    
                                type: "text",
                                title: "Numero Cuenta",
                                form: "25c43b30-e5df-48ef-a084-9236e387ebbe",
                                required: true,
                                id: "bfb9c426",
                                show: true,
                                editable: false,
                                input_type: "text",
                                value: AccountNumber,
                                max_length: 100,
    
    
                            },
                            {
    
                                type: "text",
                                title: "Detalle Cuenta",
                                form: "25c43b30-e5df-48ef-a084-9236e387ebbe",
                                required: true,
                                id: "bfb9c426",
                                show: true,
                                editable: false,
                                input_type: "text",
                                value: Description,
                                max_length: 250,
                            },
                            {
    
                                type: "text",
                                title: "Tipo Dirección",
                                form: "25c43b30-e5df-48ef-a084-9236e387ebbe",
                                required: true,
                                id: "bfb9c426",
                                show: true,
                                editable: false,
                                input_type: "text",
                                value: AddressType,
                                max_length: 250,
                            }
                        ]
                    },
                    user_email:AgentEmail
                })
            },(err,response,body)=>{
                //METODO PARA OBTENER LOS JSON DE LA CREACIÓN DE MISIONES
                load_process_data(body,WorkspaceKey)
            })
        }catch(err){
            console.log("Error en el servidor || "+err);
        }
       
}
//OBTENER MISIONES DE LOS WORKSPACE ACTIVOS
async function get_reassing_missions(req,res){
    try{
        let cont = 1;
        const informationWorkspace = await prisma.$queryRawUnsafe(`execute SP_Get_Workspace_All`);
        //PRIMER FOR PARA OBTENER LA INFORMACIÓN DE LA TABLA OPTACHECK_WORKSPACE
        for (let i = 0; i < informationWorkspace.length; i++) {
            const missionAssign = await prisma.$queryRawUnsafe(`execute `+informationWorkspace[i].ReassignSource); 
            
            //SEGUNDO FOR PARA OBTENER LA INFORMACIÓN DE LOS PROCEDIMIENTOS ALMACENADOS DE ASIGNACION
            for (let index = 0; index < missionAssign.length; index++) {
                await sleep(100);
                const element = missionAssign[index].AddressId;
                //OBTENER LA INFORMACION DE CADA MISION
                create_missions(
                     missionAssign[index].AddressId
                    ,missionAssign[index].ClientName
                    ,missionAssign[index].Form
                    ,missionAssign[index].AccountNumber
                    ,missionAssign[index].Description
                    ,missionAssign[index].AddressType
                    ,missionAssign[index].AgentEmail
                    ,informationWorkspace[i].Url
                    ,informationWorkspace[i].WorkspaceKey
                    ,informationWorkspace[i].Endpoint
                    ,informationWorkspace[i].LoggedAccessToken
                    ,informationWorkspace[i].UserAccessToken)
                if ((index == (missionAssign.length -1 ))) {
                    let get_params_header = await prisma.$queryRawUnsafe(`execute sp_execution_header_process '${informationWorkspace[i].WorkspaceKey}'`);
                    let arr =  get_params_header[0].Information.split(' ')
                    
                        let load_process = await prisma.$queryRawUnsafe(`execute ${informationWorkspace[i].UpdateSource} ${parseInt(arr[0])},${parseInt(arr[1])},${1}`);
                        console.log('SE TERMINO DE REALIZAR EL PROCESO');
                        if ((i == (informationWorkspace.length -1 ))) {
                            return res.status(200).send({message:"SE TERMINO DE REALIZAR DE PROCESAR AMBAS REASIGNACIONES"});
                        }
                }
            }
        }
    }catch(err){
        console.log("Error en el servidor || "+err);
        return res.status(500).send({message:"Error en el servidor || "+err});
    }
}
//OBTENER MISIONES DE LOS WORKSPACE ACTIVOS
async function get_assing_missions(req,res){
    try{
        let cont = 1;
        const informationWorkspace = await prisma.$queryRawUnsafe(`execute SP_Get_Workspace_All`);
        //PRIMER FOR PARA OBTENER LA INFORMACIÓN DE LA TABLA OPTACHECK_WORKSPACE
        for (let i = 0; i < informationWorkspace.length; i++) {
            const missionAssign = await prisma.$queryRawUnsafe(`execute `+informationWorkspace[i].AssignSource); 
            
            //SEGUNDO FOR PARA OBTENER LA INFORMACIÓN DE LOS PROCEDIMIENTOS ALMACENADOS DE ASIGNACION
            for (let index = 0; index < missionAssign.length; index++) {
                await sleep(100);
                const element = missionAssign[index].AddressId;
                //OBTENER LA INFORMACION DE CADA MISION
                // console.log(missionAssign.length);
                create_missions(
                     missionAssign[index].AddressId
                    ,missionAssign[index].ClientName
                    ,missionAssign[index].Form
                    ,missionAssign[index].AccountNumber
                    ,missionAssign[index].Description
                    ,missionAssign[index].AddressType
                    ,missionAssign[index].AgentEmail
                    ,informationWorkspace[i].Url
                    ,informationWorkspace[i].WorkspaceKey
                    ,informationWorkspace[i].Endpoint
                    ,informationWorkspace[i].LoggedAccessToken
                    ,informationWorkspace[i].UserAccessToken)
                if ((index == (missionAssign.length -1 ))) {
                    let get_params_header = await prisma.$queryRawUnsafe(`execute sp_execution_header_process '${informationWorkspace[i].WorkspaceKey}'`);
                    let arr =  get_params_header[0].Information.split(' ')
                        await prisma.$queryRawUnsafe(`execute ${informationWorkspace[i].UpdateSource} ${parseInt(arr[0])},${parseInt(arr[1])},${1}`);
                        console.log('SE TERMINO DE REALIZAR EL PROCESO');

                        if ((i == (informationWorkspace.length -1 ))) {
                            return res.status(200).send({message:"SE TERMINO DE REALIZAR DE PROCESAR AMBAS ASIGNACIONES"});
                        }
                }
            }
        }
    }catch(err){
        console.log("Error en el servidor || "+err);
        return res.status(500).send({message:"Error en el servidor || "+err});
    }
}

async function executeLoadProcess(req, res){
    let params = req.body;
    let jsonOrigin = params.content;
    let jsonParams = JSON.stringify(jsonOrigin);

    try{
        if(params.workspace_Id == null){
            return res.status(200).send({message:'El workspace key no fue seteado'});
        }else {
            const informationWorkspace = await prisma.$queryRawUnsafe(`execute SP_Get_Workspace_All`);
            for (let i = 0; i < informationWorkspace.length; i++) {
                if (informationWorkspace[i].WorkspaceKey == params.workspace_Id) {
                    //let request = await prisma.$queryRawUnsafe(`execute load_process_JSON_Optacheck '${jsonOrigin}','${params.workspace_Id}'`)
                    let get_params_header = await prisma.$queryRawUnsafe(`execute sp_execution_header_process '${params.workspace_Id}'`);
                    console.log(get_params_header);
                    let arr =  get_params_header[0].Information.split(' ')
                    await prisma.$queryRawUnsafe(`execute ${informationWorkspace[i].UpdateSource} ${parseInt(arr[0])},${parseInt(arr[1])},${2}`);
                    return res.status(200).send({message:'SE TERMINO DE REALIZAR EL PROCESO'});
                }
            }
            // if (request !== []) {
            //     return res.status(200).send({message:'Se grabo correctamente la data en la base de datos'});
            // } else {
            //     return res.status(404).send({ message: 'No se ha podido obtener alguna respuesta de la base de datos' })
            // }
        }
        
    } catch (error) {
        return res.status(500).send({ message: 'No se ha podido capturar la informacion requerida por el servidor || ' + error })
    }
}

schedule.scheduleJob('0 0 5  * * ?',function (){get_reassing_missions()})

module.exports = ({
    load_process_data,
    get_reassing_missions,
    get_assing_missions,
    executeLoadProcess
    // reassing_missions
})