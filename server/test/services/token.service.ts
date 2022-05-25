import { expect } from 'chai'
import moment from "moment";
import { Connection } from 'typeorm'
import connect from '../../src/db'
import { Token } from '../../src/entities/token'
import { createTokenService } from '../../src/services/token.service'

describe('[Service] Token', () => {
  let connection: Connection
  before(async () => {
    connection = await connect('token-tests')
  })

  afterEach(async () => {
    await connection
      .createQueryBuilder()
      .delete()
      .from(Token)
      .execute()
  })

  after(async () => {
    await connection.close()
  })

  describe('Cleaner.getToken', () => {
    it('should return empty when the token is expired', async () => {
      const tokenService = await createTokenService();
      const now = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss.SSSS');
      const afterThirtyMins = moment(Date.now() - 45 * 60000).format('YYYY-MM-DD HH:mm:ss.SSSS');
      await tokenService.createOrUpdateToken({
        orgId: 'ORG_ID',
        orgAccessToken: 'ORG_ACCESS_TOKEN',
        createdAt: now,
        updatedAt: afterThirtyMins,
      });

      const token = await tokenService.getToken('ORG_ID');
      expect(token).to.be.null;
    })

    it(`should return correct token when it's not expired`, async () => {
      const tokenService = await createTokenService();
      const now = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss.SSSS');
      await tokenService.createOrUpdateToken({
        orgId: 'ORG_ID',
        orgAccessToken: 'ORG_ACCESS_TOKEN',
        createdAt: now,
        updatedAt: now,
      });

      const token: Token = await tokenService.getToken('ORG_ID');
      expect(token).to.not.be.null;
      expect(token.orgId).to.eq('ORG_ID');
      expect(token.orgAccessToken).to.eq('ORG_ACCESS_TOKEN');
    })
  })
})
