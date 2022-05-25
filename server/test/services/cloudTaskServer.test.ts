/* eslint-env mocha */
import chai, { expect } from 'chai'
import chaiHttp from 'chai-http'
import sinon from 'sinon'
import { CloudTaskServerConfig, CloudTaskServerServices, createServer } from '../../src/cloudTaskServer/cloudTaskServer'
import { Cleaner } from '../../src/entities/cleaner'
import { CreateProcessLogDTO, ProcessLog } from '../../src/entities/processLog'
import { IMerit, JobData } from '../../src/types/merit'
import { logJobData } from '../../src/cloudTaskServer/services'

chai.use(chaiHttp)

const serverConfig: CloudTaskServerConfig = {
  maxNumberOfJobRetries: 5
}

const cleanerSample: Cleaner = {
  id: 'cleaner_id',
  active: true,
  name: 'Test Cleaner',
  description: '',
  orgId: 'test_org_id',
  fieldId: 'test_field_id',
  fieldName: 'Test Field',
  fieldType: 'ShortText',
  meritTemplates: [{ id: 'test_template_id', active: true }],
  createdAt: '',
  updatedAt: '',
}

const processLogDTO: CreateProcessLogDTO = {
  meritId: 'test_merit_id',
  orgId: 'test_org_id',
  oldValue: 'old_value',
  newValue: 'new_value',
  fetcherRunId: '',
  fieldId: 'test_field_id',
  cleanerId: 'cleaner_id'
}

const processMeritBodyDTO: JobData = {
  meritId: 'test_merit_id',
  newFieldValue: { fieldId: 'test_field_id', value: 'new_value'},
  oldFieldValue: { fieldId: 'test_field_id', value: 'old_value'},
  meta: {
    orgId: 'test_org_id',
    cleanerId: 'test_cleaner'
  },
}

const processLogSample: ProcessLog = {
  id: 'test_id',
  meritId: 'test_merit_id',
  orgId: 'test_org_id',
  oldValue: 'old_value',
  newValue: 'new_value',
  fetcherRunId: '',
  fieldId: 'test_field_id',
  cleaner: cleanerSample,
  createdAt: '',
  updatedAt: '',
}

const getErrorMock = (status: number) => {
  const responseErrorMock: Error & { response?: { status: number }} = new Error()
  return {
    ...responseErrorMock,
    response: { status }
  }
}

describe('Cloud Tasks Sever', () => {
  const serverServices: CloudTaskServerServices = {
    editField: async (orgId: string, meritId: string, fieldId: string, newValue: string) => {
      return Promise.resolve({} as unknown as IMerit)
    },
    logJobData: logJobData({
      save: async (processLogDTO: CreateProcessLogDTO) => Promise.resolve(processLogSample),
      find: () => Promise.resolve([[processLogSample], 1])
    }),
    scheduleRetryJob: (jobData: JobData) => Promise.resolve(),
    logFailedJob: (jobData:JobData) => Promise.resolve(),
    findProcessLogs: (value: string, page: number) => Promise.resolve([[], 0])
  }

  describe('/health', () => {
    it('should return response with status 200 if server is live', async () => {
      const server = createServer(serverConfig, serverServices)
      const res = await chai.request(await server.listen(8000))
        .get('/health')

      expect(res).to.have.status(200)

      await server.close()
    })
  })

  describe('/process-merit', () => {  
    context('Happy paths', () => {
      let server, serverRunningInstance, sandbox, spyEditField, spyLogJobData
      before(async () => {
        sandbox = sinon.createSandbox()
        spyEditField = sandbox.spy(serverServices, 'editField')
        spyLogJobData = sandbox.spy(serverServices, 'logJobData')
        server = createServer(serverConfig, serverServices)
        serverRunningInstance = await server.listen(8000)
      })
    
      after(async () => {
        sandbox.restore()
        await server.close()
      })

      it('should process job and return 200', (done) => {
        chai.request(serverRunningInstance)
          .post('/process-merit')
          .send(processMeritBodyDTO)
          .end((err, res) => {
            expect(res).to.have.status(200)
            expect(spyEditField.calledOnce).to.be.true
            expect(spyEditField.calledWith(
              processMeritBodyDTO.meta.orgId,
              processMeritBodyDTO.meritId,
              processMeritBodyDTO.newFieldValue.fieldId,
              processMeritBodyDTO.newFieldValue.value
            )).to.be.true
            expect(spyLogJobData.calledOnce)
            done()
          })
      })
    })

    context('Job fails to process', () => {
      const responseErrorMock400 = getErrorMock(400)
      const responseErrorMock403 = getErrorMock(403)
      const responseErrorMock500 = getErrorMock(500)


      it('should return 200 if merit is noneditable (reply from merit is 400)', async () => {
        const serverServicesStub = {
          ...serverServices,
          editField: sinon.stub().throws(responseErrorMock400)
        }
        const server = createServer(serverConfig, serverServicesStub)
        const serverRunningInstance = await server.listen(8000)

        const res = await chai.request(serverRunningInstance)
          .post('/process-merit')
          .send(processMeritBodyDTO)

        expect(res).to.have.status(200)

        server.close()
      })

      it('should return error status if processing fails and CTRetries is < max number of retries', async () => {
        const serverServicesStub: CloudTaskServerServices = {
          ...serverServices,
          editField: sinon.stub().throws(responseErrorMock403)
        }
        const server = createServer(serverConfig, serverServicesStub)
        const serverRunningInstance = await server.listen(8000)

        const res = await chai.request(serverRunningInstance)
          .post('/process-merit')
          .set('X-AppEngine-TaskExecutionCount', '1')
          .send(processMeritBodyDTO)

        expect(res).to.have.status(403)

        server.close()
      })

      it('should schedule back job in 12 hours if number of CTRetries is >= max number of retries', async () => {
        const sandbox = sinon.createSandbox()
        const serverServicesStub: CloudTaskServerServices = {
          ...serverServices,
          editField: sinon.stub().throws(responseErrorMock500)
        }
        const spyScheduleRetryJob = sandbox.spy(serverServicesStub, 'scheduleRetryJob')
        const server = createServer(serverConfig, serverServicesStub)
        const serverRunningInstance = await server.listen(8000)

        const res = await chai.request(serverRunningInstance)
          .post('/process-merit')
          .set('X-AppEngine-TaskExecutionCount', serverConfig.maxNumberOfJobRetries.toString())
          .send(processMeritBodyDTO)

        expect(spyScheduleRetryJob.calledOnce).to.be.true
        expect(res).to.have.status(200)

        server.close()
      })

      it('should only log job to database if rescheduled processing fails', async () => {
        const sandbox = sinon.createSandbox()
        const serverServicesStub: CloudTaskServerServices = {
          ...serverServices,
          editField: sinon.stub().throws(responseErrorMock500)
        }
        const spySaveJobForRetry = sandbox.spy(serverServicesStub, 'logFailedJob')
        const server = createServer(serverConfig, serverServicesStub)
        const serverRunningInstance = await server.listen(8000)

        const res = await chai.request(serverRunningInstance)
          .post('/process-merit')
          .set('X-AppEngine-TaskExecutionCount', serverConfig.maxNumberOfJobRetries.toString())
          .send({ ...processMeritBodyDTO, retry: 1 })

        expect(spySaveJobForRetry.calledOnce).to.be.true
        expect(res).to.have.status(200)

        server.close()
      })
    })
  })
})
