import { DeepPartial, MoreThan } from "typeorm";
import { API } from "../constant";
import { Token } from "../entities/token";
import connect from "../db";
import moment from "moment";

const TOKEN_VALID_PERIOD_IN_MINS = 30

export async function createTokenService() {
  const connection = await connect(API)
  const repository = connection.getRepository(Token);

  const createOrUpdateToken = async (data: DeepPartial<Token>) => {
    await repository.save(data);
  }

  const getToken = async (orgId: string): Promise<Token | null> => {
    const timePoint = moment(Date.now() - TOKEN_VALID_PERIOD_IN_MINS * 60000).format('YYYY-MM-DD HH:mm:ss.SSSS')
    const token = await repository.findOne({
      where: { 
        orgId,
        updatedAt: MoreThan(timePoint)
      }
    })
    return token || null
  }

  const deleteToken = async (orgId: string) => {
    await repository.delete({ orgId });
  }

  return {
    createOrUpdateToken,
    deleteToken,
    getToken,
  }
}
