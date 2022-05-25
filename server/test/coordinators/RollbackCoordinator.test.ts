/* eslint-env mocha */
import { expect } from 'chai'
import sinon from 'sinon'
import { RollbackCoordinator, RollbackCoordinatorServices } from '../../src/coordinators/RollbackCoordinator'
import { ProcessLog } from '../../src/entities/processLog'
import { JobData } from '../../src/types/merit'

const processLogTemplate: ProcessLog = {
  id: '',
  orgId: 'test_org_id',
  oldValue: '',
  newValue: '',
  meritId: '',
  cleaner: {
    id: 'test_cleaner_id',
    orgId: 'test_org_id',
    active: true,
    name: 'test_cleaner',
    description: '',
    fieldId: 'test_field_id',
    fieldName: 'TestField',
    fieldType: 'ShortText',
    meritTemplates: [],
    createdAt: '',
    updatedAt: '',
  },
  fieldId: 'test_field_id',
  fetcherRunId: '',
  createdAt: '',
  updatedAt: ''
}


describe('Rollback coordinator', () => {
  let initCall = false
  let services: RollbackCoordinatorServices

  beforeEach(() => {
    services = {
      addRollbackJobToCloudTask: async () => Promise.resolve(),
      initFindProcessLogs: (pageSize: number) => async (value: string, page: number) => {
        if (initCall) return [[], 0]
        initCall = true

        return Promise.resolve([
          [
            {
              ...processLogTemplate,
              oldValue: 'test_old_value_1',
              newValue: value,
              meritId: 'test_merit_id_1',
            },
            {
              ...processLogTemplate,
              oldValue: 'test_old_value_2',
              newValue: value,
              meritId: 'test_merit_id_2',
            }
          ],
          2
        ])
      },
    }
  })

  afterEach(() => {
    initCall = false
  })

  it('should schedule correct job for rollback (old value should be new value)', async () => {
    const sandbox = sinon.createSandbox()
    const spyAddRollbackJobToCloudTask = sandbox.spy(services, 'addRollbackJobToCloudTask')
    const coordinator = new RollbackCoordinator({
      orgId: processLogTemplate.orgId,
      cleanerId: processLogTemplate.cleaner.id,
      rollbackValue: ''
    }, {}, services)
    
    const log: ProcessLog = { ...processLogTemplate }
    const { meritId, fieldId, orgId, cleaner, newValue, oldValue } = log

    const cloudTaskScheduledJobVerificationObject: JobData = {
      meritId,
      newFieldValue: {
        fieldId,
        value: oldValue
      },
      oldFieldValue: {
        fieldId,
        value: newValue
      },
      meta: {
        orgId,
        cleanerId: cleaner.id
      }
    }
    
    await coordinator.processLog(log)

    expect(spyAddRollbackJobToCloudTask.calledOnce).to.be.true
    expect(spyAddRollbackJobToCloudTask.calledWith(cloudTaskScheduledJobVerificationObject)).to.be.true

    sandbox.restore()
  })

  it('should schedule a job for all logs', async () => {
    const sandbox = sinon.createSandbox()
    const spyAddRollbackJobToCloudTask = sandbox.spy(services, 'addRollbackJobToCloudTask')
    
    const coordinator = new RollbackCoordinator({
      orgId: processLogTemplate.orgId,
      cleanerId: processLogTemplate.cleaner.id,
      rollbackValue: 'test'
    }, {}, services)

    await coordinator.start()

    expect(spyAddRollbackJobToCloudTask.calledTwice).to.be.true
    expect(coordinator.getNumberOfProcessedLogs()).to.equal(2)

    sandbox.restore()
  })

  it('should process logs in pages correctly', async () => {
    const sandbox = sinon.createSandbox()

    let fnIncr = 0
    const coordinator = new RollbackCoordinator({
      orgId: processLogTemplate.orgId,
      cleanerId: processLogTemplate.cleaner.id,
      rollbackValue: ''
    }, { pageSize: 1 }, {
      ...services,
      initFindProcessLogs: (pageSize: number) => (value: string, page: number) => {
        fnIncr++
        if (fnIncr > 2) return Promise.resolve([[], 2])

        return Promise.resolve([
          [{ ...processLogTemplate }],
          2
        ])
      }
    })

    await coordinator.start()

    expect(coordinator.getNumberOfProcessedPages()).to.equal(2)

    sandbox.restore()
  })
})
