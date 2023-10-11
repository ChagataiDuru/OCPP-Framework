import { Controller } from '@nestjs/common';

@Controller('ocpp')
export class OcppController {}
import { Controller, Get, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiOkResponse } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { CurrentUser } from './decorators/current-user.decorator';
import { OcppDto } from './dtos/ocpp.dto';
import { AdminGuard } from 'src/guards/admin.guard';

@Controller('ocpp')
@Serialize(OcppDto)
export class OcppController {
    constructor(
        @Inject('OCPP_SERVICE') private client: ClientProxy,
    ) {}

    @Get('/charge-stations')
    async getAllChargeStations() {
        const chargeStations = await this.client.send({ cmd: 'getAllChargeStations' }, {}).toPromise();
        if (!chargeStations) {
            return new NotFoundException('No charge stations found');
        }
        return chargeStations;
    }

    @Get('/charge-stations/:id')
    @UseGuards(AdminGuard)
    async getChargeStation(@Param('id') id: string) {
        const chargeStation = await this.client.send({ cmd: 'getChargeStationById' }, id).toPromise();
        if (!chargeStation) {
            return new NotFoundException('Charge station not found');
        }
        return chargeStation;
    }

    @Get('/charge-stations/:id/transactions')
    @UseGuards(AdminGuard)
    async getChargeStationTransactions(@Param('id') id: string) {
        const transactions = await this.client.send({ cmd: 'getChargeStationTransactions' }, id).toPromise();
        if (!transactions) {
            return new NotFoundException('No transactions found for charge station');
        }
        return transactions;
    }

    @Get('/transactions/:id')
    async getTransaction(@Param('id') id: string, @CurrentUser() user: any) {
        const transaction = await this.client.send({ cmd: 'getTransactionById' }, id).toPromise();
        if (!transaction) {
            return new NotFoundException('Transaction not found');
        }
        if (transaction.userId !== user.userId && !user.isAdmin) {
            return new NotFoundException('Transaction not found');
        }
        return transaction;
    }
}
