import { Message, ValidationResult } from "../types/types";

function MessageValidation(data: string) : ValidationResult{
    try {

        const parsedData = JSON.parse(data);

        if(!parsedData.type || !parsedData.payload)
            return {isValid: false, errMsg: "Missing type or payload"}

        if (!["create", "join", "chat", "leave"].includes(parsedData.type))
            return {isValid: false, errMsg: "Type is not correct"}
          
        if (!parsedData.payload.roomId || typeof parsedData.payload.roomId !== "string")
            return {isValid: false,errMsg: "Room is not present or is not of string",};

        if(parsedData.type==="chat"){
            if(!parsedData.payload.message || typeof parsedData.payload.message!=="string")
                return {isValid: false, errMsg: "Payload message is not of correct type"}
        }

        return {isValid: true, errMsg: "No errors", message: parsedData as Message}
    } catch (error) {
        console.log(error);
        return {
          isValid: false,
          errMsg:
            error instanceof Error ? error.message : "Invalid JSON format",
        };
    }
}

export default MessageValidation;