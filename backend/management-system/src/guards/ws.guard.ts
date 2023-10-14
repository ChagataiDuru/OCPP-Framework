import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Socket } from "socket.io";

@Injectable()
export class WsAuthenticatedGuard implements CanActivate {
  //constructor(private userService: UserController) {}

  async canActivate(context: ExecutionContext) {
    const client: Socket = context.switchToWs().getClient();
    const UserId = client.handshake.headers.userId;
    if (!UserId) {
      return false;
    }

    //const user = await this.userService.findOneById(Number(UserId));
  
    const data = context.switchToWs().getData()
    console.log(data)
  
    return true;
  }
}