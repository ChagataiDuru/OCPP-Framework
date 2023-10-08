import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Socket } from "socket.io";
import { UserService } from "../user/user.service";

@Injectable()
export class WsAuthenticatedGuard implements CanActivate {
  constructor(private userService: UserService) {}

  async canActivate(context: ExecutionContext) {
    const client: Socket = context.switchToWs().getClient();
    const UserId = client.handshake.headers.userId;
    if (!UserId) {
      return false;
    }

    const user = await this.userService.findOneById(Number(UserId));
    if (!user) {
      return false;
    }
  
    const data = context.switchToWs().getData()
    console.log(data)
  
    return true;
  }
}