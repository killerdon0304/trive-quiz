"use client"
import React, { useEffect, useState } from 'react'
import { withTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Modal, Tabs } from 'antd'
import { useRef } from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { useDispatch, useSelector } from 'react-redux'
import { categoriesApi, getusercoinsApi, UserCoinScoreApi } from 'src/store/actions/campaign'
import { selectCurrentLanguage } from 'src/store/reducers/languageSlice'
import { updateUserDataInfo } from 'src/store/reducers/userSlice'
import { battleDataClear, groupbattledata, LoadGroupBattleData } from 'src/store/reducers/groupbattleSlice'
import { Loadtempdata, playwithfreind, reviewAnswerShowSuccess } from 'src/store/reducers/tempDataSlice'
import { imgError, roomCodeGenerator } from 'src/utils'
import { settingsData, sysConfigdata } from 'src/store/reducers/settingsSlice'
import FirebaseData from 'src/utils/Firebase'
import { Form } from 'react-bootstrap'
import { useRouter } from 'next/router'
import Breadcrumb from 'src/components/Common/Breadcrumb'
import versusImg from 'src/assets/images/versus.svg'
import { IoShareSocialOutline } from "react-icons/io5";
import ShareMenu from 'src/components/Common/ShareMenu';
import { t } from 'i18next'
import coinimg from "src/assets/images/coin.svg"
import vsimg from "src/assets/images/vs.svg"

const PlaywithFriendBattle = () => {

  const MySwal = withReactContent(Swal)


  const dispatch = useDispatch()

  // store data getz
  const userData = useSelector(state => state.User)

  const groupBattledata = useSelector(groupbattledata)

  const selectdata = useSelector(settingsData)

  const systemconfig = useSelector(sysConfigdata)

  const appdata = selectdata && selectdata.filter(item => item.type == 'app_name')

  const appName = appdata && appdata?.length > 0 ? appdata[0].message : ''

  const getData = useSelector(playwithfreind)

  const TabPane = Tabs.TabPane

  const [category, setCategory] = useState({
    all: '',
    selected: '',
    category_name: ""
  })

  const inputRef = useRef()

  const [loading, setLoading] = useState(true)

  const [shouldGenerateRoomCode, setShouldGenerateRoomCode] = useState(false)

  const [selectedCoins, setSelectedCoins] = useState({ all: '', selected: '' })

  const [playwithfriends, setPlaywithfriends] = useState(false)

  const [isButtonClicked, setIsButtonClicked] = useState(false)

  const [inputCode, setInputCode] = useState(false)

  const [showStart, setShowStart] = useState(false)

  const [dociddelete, setDocidDelete] = useState(false)

  const [battleUserData, setBattleUserData] = useState([])

  const [joinuserpopup, setJoinUserPopup] = useState(false)

  const [createdByroom, setCreatedByRoom] = useState()

  const { db, firebase } = FirebaseData()

  const enteryFee = groupBattledata

  const navigate = useRouter()

  let languageid = getData.language_id

  let category_selected = systemconfig && systemconfig?.battle_mode_one_category == '1' ? category?.selected : ''

  let battle_mode_one_entry_coin_data = systemconfig && systemconfig?.battle_mode_one_entry_coin

  let username = userData?.data?.name || userData?.data?.email || userData?.data?.mobile

  let userprofile = userData?.data?.profile ? userData?.data?.profile : ''

  let useruid = userData?.data?.id

  let usercoins = userData && userData?.data?.coins


  let selectedcoins = Number(selectedCoins.selected)

  let inputText = useRef(null)

  let roomiddata = groupBattledata.roomID

  let owner = useRef({
    readyplay: null,
    ownerID: null,
    roomid: null
  })

  // get category data
  const getAllData = () => {
    categoriesApi(
      1,
      2,
      response => {
        let categoires = response.data
        // Filter the categories based on has_unlocked and is_premium
        const filteredCategories = categoires.filter(category => {
          return category.is_premium === '0'
        })
        setCategory({
          ...category,
          all: filteredCategories,
          selected: filteredCategories[0].id,
          category_name: filteredCategories[0].category_name
        })
        setLoading(false)
      },
      error => {
        setLoading(false)
        console.log(error)
      }
    )
  }

  // database collection
  const createBattleRoom = async (
    categoryId,
    name,
    profileUrl,
    uid,
    roomCode,
    roomType,
    entryFee,
    questionlanguageId
  ) => {
    try {
      let documentreference = db.collection('battleRoom').add({
        categoryId: categoryId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: uid,
        entryFee: entryFee ? entryFee : 0,
        languageId: questionlanguageId,
        readyToPlay: false,
        categoryName: category?.category_name,
        roomCode: roomCode ? roomCode : '',
        user1: {
          answers: [],
          name: name,
          points: 0,
          profileUrl: profileUrl,
          uid: uid,
          correctAnswers: 0
        },
        user2: {
          answers: [],
          name: '',
          points: 0,
          profileUrl: '',
          uid: '',
          correctAnswers: 0
        }
      })
      // created id by user to check for result screen
      LoadGroupBattleData('createdby', uid)
      LoadGroupBattleData('entryFee', entryFee)

      setShowStart(true)

      return await documentreference
    } catch (error) {
      toast.error(error)
    }
  }

  // delete battle room
  const deleteBattleRoom = async documentId => {
    try {
      await db.collection('battleRoom').doc(documentId).delete()
    } catch (error) {
      toast.error(error)
    }
  }

  // find room
  const searchBattleRoom = async (languageId, categoryId) => {
    try {
      let userfind = await db
        .collection('battleRoom')
        .where('languageId', '==', languageId)
        .where('categoryId', '==', categoryId)
        .where('roomCode', '==', '')
        .where('user2.uid', '==', '')
        .get()

      let userfinddata = userfind.docs

      let index = userfinddata.findIndex(elem => {
        return elem.data().createdBy == useruid
      })

      if (index !== -1) {
        deleteBattleRoom(userfinddata[index].id)
        userfinddata.splice(userfinddata?.length, index)
      }

      return userfinddata
    } catch (err) {
      toast.error('Error getting document', err)
    }
  }

  // search room
  const searchRoom = async () => {

    if (selectedCoins.selected === "") {
      toast.error("Please select coins and enter value in numeric value")
      return
    }

    let inputCoincheck = inputText.current.value
    if (Number(inputCoincheck) > Number(usercoins)) {
      toast.error(t('you dont have enough coins'))
      return
    }

    try {
      let documents = await searchBattleRoom(languageid, category_selected)

      let roomdocid

      if (documents?.length !== 0) {
        let room = documents

        roomdocid = room.id
      } else {
        roomdocid = await createRoom()
      }

      // await subscribeToBattleRoom(roomdocid);
      LoadGroupBattleData('roomid', roomdocid)
    } catch (error) {
      toast.error(error)
      console.log(error)
    }
  }

  // redirect question screen
  const questionScreen = (roomcode, catid) => {
    navigate.push('/random-battle/play-with-friend-play')
    let data = {
      category_id: catid,
      room_id: roomcode,
      destroy_match: '0'
    }
    Loadtempdata(data)
  }

  //create room for battle
  const createRoom = async () => {

    // battleroom joiing state
    if (usercoins < 0 || usercoins === '0') {
      toast.error(t('you dont have enough coins'))
      return
    }

    let roomCode = ''

    //genarate room code
    roomCode = roomCodeGenerator("onevsone")
    setShouldGenerateRoomCode(roomCode)
    LoadGroupBattleData('roomCode', roomCode)

    let data = await createBattleRoom(
      category_selected,
      username,
      userprofile,
      useruid,
      roomCode,
      'public',
      selectedcoins,
      languageid,

    )
    // popup user found with friend
    setPlaywithfriends(true)

    return data.id
  }

  // joinroom
  const joinRoom = async (name, profile, usernameid, roomcode, coin) => {
    try {
      if (!roomcode) {
        setIsButtonClicked(false)
        setJoinUserPopup(false)
        toast.error(t('please enter a room code'))
      } else {
        let result = await joinBattleRoomFrd(name, profile, usernameid, roomcode, coin)
        if (typeof result === 'undefined') {
          setIsButtonClicked(false)
          setJoinUserPopup(false)
          toast.error(t('room code is not valid'))
        } else {
          setJoinUserPopup(true)

          // await subscribeToBattleRoom(result.id);
          LoadGroupBattleData('roomid', result.id)

          const status = 1

          if (groupBattledata.entryFee > 0) {
            UserCoinScoreApi(
              groupBattledata.entryFee,
              null,
              null,
              t('Played Battle'),
              status,
              response => {
                getusercoinsApi(
                  responseData => {
                    updateUserDataInfo(responseData.data)
                  },
                  error => {
                    console.log(error)
                  }
                )
              },
              error => {
                console.log(error)
              }
            )
          }
        }
      }
    } catch (e) {
      console.log('error', e)
    }
  }

  // get userroom
  const getMultiUserBattleRoom = async roomcode => {
    try {
      let typeBattle = await db.collection('battleRoom').where('roomCode', '==', roomcode).get()
      return typeBattle
    } catch (e) {
      console.log('error', e)
    }
  }

  // joinBattleRoomFrd
  const joinBattleRoomFrd = async (name, profile, usernameid, roomcode, coin) => {
    try {
      // check roomcode is valid or not
      let mulituserbattle = await getMultiUserBattleRoom(roomcode)

      // invalid room code
      if (mulituserbattle.docs === '') {
        toast.error(t('Invalid Room Code'))
      }

      // // game started code
      if (mulituserbattle.docs[0].data().readyToPlay) {
        toast.success(t('Game Started'))
      }

      // // not enough coins
      // if (mulituserbattle.docs[0].data().entryFee > coin) {
      //     toast.error("Not enough coins");
      //     return;
      // }

      //user2 update
      let docRef = mulituserbattle.docs[0].ref

      return db.runTransaction(async transaction => {
        let doc = await transaction.get(docRef)
        if (!doc.exists) {
          toast.error(t('Document does not exist!'))
        }

        let userdetails = doc.data()

        let user2 = userdetails.user2

        if (user2.uid === '') {
          transaction.update(docRef, {
            'user2.name': name,
            'user2.uid': usernameid,
            'user2.profileUrl': profile
          })
        }
        return doc
      })

      //
    } catch (e) {
      console.log('error', e)
    }
  }

  // coins data
  const coinsdata = [
    { id: '1', num: battle_mode_one_entry_coin_data },
    { id: '2', num: battle_mode_one_entry_coin_data * 2 },
    { id: '3', num: battle_mode_one_entry_coin_data * 3 },
    { id: '4', num: battle_mode_one_entry_coin_data * 4 }
  ]

  // selected coins data
  const selectedCoinsdata = data => {
    setSelectedCoins({ ...selectedCoins, selected: data.num })
    inputText.current.value = ''
  }

  // inputfeild data
  const handlechange = e => {
    setInputCode(e.target.value)
    setInputCode(e.target.value)
    // }
    setInputCode(e.target.value)
    // }
  }

  // start button
  const startGame = e => {
    let roomid = groupBattledata.roomID

    let docRef = db.collection('battleRoom').doc(roomid)

    return db.runTransaction(async transaction => {
      let doc = await transaction.get(docRef)
      if (!doc.exists) {
        toast.error(t('Document does not exist!'))
      }

      let userdetails = doc.data()

      let user2 = userdetails.user2

      if (user2.uid !== '') {
        transaction.update(docRef, {
          readyToPlay: true
        })
        // subscribeToBattleRoom(roomid)
      } else {
        toast.error(t('Player is not join yet'))
      }

      return doc
    })
  }

  useEffect(() => {
    getAllData()
  }, [selectCurrentLanguage])

  // get id from localstorage for start button
  let createdby = groupBattledata.createdBy

  // oncancel creater room popup delete room
  const onCancelbuttondeleteBattleRoom = async documentId => {

    let documentRef = db.collection('battleRoom').doc(documentId)

    documentRef.onSnapshot(
      { includeMetadataChanges: true },
      doc => {
        if (doc.exists) {
          let battleroom = doc.data()

          let roomid = doc.id

          let createdby = battleroom.createdBy

          if (useruid == createdby) {
            MySwal.fire({
              text: t('Room is deleted')
            })
            deleteBattleRoom(roomid)
            battleDataClear()
          }
        }
      },
      error => {
        console.log('err', error)
      }
    )
  }

  // snapshot listner
  useEffect(() => {
    // subsscribebattle room
    let documentRef = db.collection('battleRoom').doc(roomiddata)
    documentRef.onSnapshot(
      { includeMetadataChanges: true },
      doc => {
        if (doc.exists) {
          let battleroom = doc.data()

          // state set doc id
          setDocidDelete(doc.id)

          let user1 = battleroom.user1

          let user2 = battleroom.user2

          let category_id = battleroom.categoryId

          let user1uid = battleroom.user1.uid

          let user2uid = battleroom.user2.uid

          let readytoplay = battleroom.readyToPlay

          let createdby = battleroom.createdBy

          if (userData?.data?.id === user1uid) {
            setBattleUserData([user2])
          } else {
            setBattleUserData([user1])
          }

          let check = battleroom.readyToPlay

          let roomCode = battleroom.roomCode

          if (check) {
            questionScreen(roomCode, category_id)
          }

          // state popup of create and join room
          if (useruid == createdby) {
            setJoinUserPopup(false)
            setPlaywithfriends(true)
          } else {
            setJoinUserPopup(true)
            setPlaywithfriends(false)
          }

          owner.current.ownerID = createdby

          owner.current.readyplay = readytoplay

          // delete room by owner on click cancel button
          setCreatedByRoom(createdby)

          // if user2 empty then popup will remove
          if (user2uid == '') {
            owner.current.ownerID = null
            setJoinUserPopup(false)
          }
        } else {
          if (owner.current.readyplay == false && owner.current.ownerID !== null) {
            if (useruid !== owner.current.ownerID) {
              MySwal.fire({
                text: t('Room is deleted by owner')
              }).then(result => {
                if (result.isConfirmed) {
                  navigate.push('/random-battle/play-with-friend-battle')
                  return false
                }
              })
            }
          }
        }
      },
      error => {
        console.log('err', error)
      }
    )
  }, [groupBattledata])

  useEffect(() => {
    setSelectedCoins({ ...selectedCoins, selected: coinsdata[0].num })
  }, [])

  // on cancel join user button
  const onCanceljoinButton = async roomid => {
    setJoinUserPopup(false)

    try {
      setJoinUserPopup(false)
      const documentRef = db.collection('battleRoom').doc(roomid)

      await documentRef.update({
        'user2.name': '',
        'user2.uid': '',
        'user2.profileUrl': ''
      })

      navigate.push('/random-battle/play-with-friend-battle')
      setIsButtonClicked(false)
    } catch (error) {
      console.log('Error:', error)
    }
  }

  const handleJoinButtonClick = () => {
    setIsButtonClicked(true)
    joinRoom(username, userprofile, useruid, inputCode, usercoins)
  }

  // select category
  const handleSelectCategory = e => {
    const index = e.target.selectedIndex
    const el = e.target.childNodes[index]
    let cat_id = el.getAttribute('id')
    let cat_name = el.getAttribute('name')
    setCategory({ ...category, selected: cat_id, category_name: cat_name })
  }

  // share room code popUp handlers
  const handleSharePopup = () => {
    const sharePopup = document.getElementById('sharePopup');
    sharePopup.style.display = 'block'
  }
  const closeSharePopup = () => {
    const sharePopup = document.getElementById('sharePopup');
    sharePopup.style.display = 'none'
  }


  const currentUrl = process.env.NEXT_PUBLIC_APP_WEB_URL + navigate.asPath;
  const [modalVisible, setModalVisible] = useState(false);

  const showModal = () => {
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };


  const handleBatlleFeesChange = (e) => {
    // toast.error(e.target.value)
    e.preventDefault();

    const inputValue = e.target.value;

    // Check if the input is a valid number or an empty string
    if (/^\d+$/.test(inputValue) || inputValue === '') {

      // Check if the numeric value is greater than zero
      if (e.target.value >= 0) {
        // Update state or perform other actions
        // (e.g., setSelectedCoins or handle other logic)
        setSelectedCoins({ ...selectedCoins, selected: e.target.value });
      } else {
        // Show an error message for non-positive values
        setSelectedCoins({ ...selectedCoins, selected: 0 });
      }
    } else {
      // Show an error message for invalid input
      toast.error("Please Enter Numeric Values");
    }

  }

  useEffect(() => {
    dispatch(reviewAnswerShowSuccess(false))
  }, [])




  return (
    <>
      <Breadcrumb title={t('1 vs 1 Battle')} content="" contentTwo="" />
      <div className='SelfLearning battlequiz my-5'>
        <div className='container'>
          <div className="playFrndWrapper">
            <div className='row morphisam'>
              {/* battle screen */}
              <div className='col-md-12  col-xl-12 col-xxl-12 col-12'>
                <h3 className='playFrndTitle'>{t("play-with-friend")}</h3>
              </div>
              <div className='col-md-12  col-xl-12 col-xxl-12 col-12'>
                <Tabs defaultActiveKey='1'>
                  <TabPane tab={t('Create Room')} key='1'>
                    {(() => {
                      if (systemconfig && systemconfig.battle_random_category_mode == '1') {
                        return (
                          <div className='bottom__cat__box playFrndSelecter'>
                            <div className="seleterWrapper">
                              <Form.Select
                                aria-label='Default select example'
                                size='lg'
                                className='selectform'
                                onChange={e => handleSelectCategory(e)}
                              >
                                {loading ? (
                                  <option>{t('Loading...')}</option>
                                ) : (
                                  <>
                                    {category.all ? (
                                      category.all.map((cat_data, key) => {
                                        // console.log("",cat_data)
                                        const { category_name } = cat_data
                                        return (
                                          <option key={key} value={cat_data.key} id={cat_data.id} no_of={cat_data.no_of} name={cat_data.category_name}>
                                            {category_name}
                                          </option>
                                        )
                                      })
                                    ) : (
                                      <option>{t('No Category Data Found')}</option>
                                    )}
                                  </>
                                )}
                              </Form.Select>
                            </div>
                          </div>
                        )
                      }
                    })()}
                    <div className='inner_content d-flex align-items-center flex-wrap'>
                      <span >
                        {t("Entry Fee")}:
                      </span>
                      <ul className='coins_deduct d-flex ps-0 align-items-center my-3'>
                        {coinsdata.map((data, idx) => {
                          return (
                            <li key={idx} className={`list-unstyled ${data.num == selectedcoins ? 'active-one' : 'unactive-one'}`} onClick={e => selectedCoinsdata(data)}>
                              <img src={coinimg.src} alt='coin' />

                              <span>
                                {data.num}
                              </span>
                            </li>

                          )
                        })}
                        <div className='input_coins'>
                          <input
                            type='number'
                            placeholder='00'
                            min='0'
                            value={selectedCoins.selected}
                            onChange={(e) => handleBatlleFeesChange(e)}
                            // onChange={e => }
                            ref={inputText}
                          />
                        </div>
                      </ul>

                    </div>

                    {/* coins */}
                    <div className='total_coins my-4 ml-0'>
                      <h5 className=' text-center '>
                        {t('Current Coins')} : {usercoins < 0 ? 0 : usercoins}
                      </h5>
                    </div>

                    {/* create room */}
                    <div className='create_room'>
                      <button className='btn btn-primary' onClick={() => searchRoom()}>
                        {t('Create Room')}
                      </button>
                    </div>
                  </TabPane>
                  <TabPane tab={t('Join Room')} key='2'>
                    <div className='join_room_code'>
                      <input
                        type='text'
                        placeholder={t('Enter Code')}
                        onChange={handlechange}
                        className='join_input'
                        min='0'
                        ref={inputRef}
                      />
                    </div>
                    <div className='join_btn mt-4'>
                      <button className='btn btn-primary' onClick={handleJoinButtonClick} disabled={isButtonClicked}>
                        {' '}
                        {t('Join Room')}
                      </button>
                    </div>
                  </TabPane>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* play with friends modal */}

      <Modal
        maskClosable={false}
        centered
        visible={playwithfriends}
        onOk={() => setPlaywithfriends(false)}
        onCancel={() => {
          setPlaywithfriends(false)
          onCancelbuttondeleteBattleRoom(dociddelete)
        }}
        footer={null}
        className='custom_modal_notify retry-modal playwithfriend'
      >
        {playwithfriends ? (
          <>
            <div className='randomplayer'>
              <div className='main_screen'>
                <h3 className='text-center headlineText'>
                  {t('play-with-friend')}
                </h3>
                <div className='room_code_screen'>
                  <h3>{shouldGenerateRoomCode}</h3>
                  {process.env.NEXT_PUBLIC_SEO === "true" ? <>
                    <span className='shareIcon' onClick={showModal}>
                      <IoShareSocialOutline />
                    </span>
                    <p>{t('share-room-code-friends')}</p>
                  </> : null}
                </div>
                <>
                  {modalVisible &&
                    <ShareMenu
                      currentUrl={currentUrl}
                      shouldGenerateRoomCode={shouldGenerateRoomCode}
                      appName={appName}
                      showModal={modalVisible}
                      hideModal={() => setModalVisible(false)}
                      entryFee={groupBattledata?.entryFee}
                      categoryName={category?.category_name}
                    />
                  }
                </>

                <div className='inner_Screen'>
                  <div className='user_profile'>
                    <img src={userData?.data?.profile} alt='wrteam' onError={imgError} />
                    <p className='mt-3 userName'>{userData?.data?.name || userData?.data?.email || userData?.data?.mobile}</p>
                    <span className='createJoinSpan'>{t("Creator")}</span>
                  </div>
                  {battleUserData?.map((data, index) => {
                    return (
                      <>
                        <div className='vs_image'>
                          <img src={versusImg.src} alt='versus' height={100} width={50} />
                        </div>
                        <div className='opponent_image' key={index}>
                          <img src={data.profileUrl} alt='wrteam' onError={imgError} />
                          <p className='mt-3 userName'>{data.name ? data.name : t('Waiting')}</p>
                          <span className='createJoinSpan'>{t("Joiner")}</span>
                        </div>
                      </>
                    )
                  })}
                </div>
                {(() => {
                  if (userData?.data?.id == createdby) {
                    return (
                      <>
                        {showStart ? (
                          <div className='start_game'>
                            <button className='btn btn-primary' onClick={e => startGame(e)}>
                              {t('Start Game')}
                            </button>
                          </div>
                        ) : null}
                      </>
                    )
                  }
                })()}
              </div>
            </div>
          </>
        ) : (
          ''
        )}
      </Modal>
      {/* join user popup */}
      {
        joinuserpopup ? (
          <Modal
            centered
            maskClosable={false}
            keyboard={false}
            visible={joinuserpopup}
            onOk={() => setJoinUserPopup(false)}
            onCancel={() => {
              setJoinUserPopup(false)
              onCanceljoinButton(roomiddata)
            }}
            footer={null}
            className='custom_modal_notify retry-modal playwithfriend'
          >
            <>
              <div className='randomplayer'>
                <div className='main_screen'>
                  <div className='inner_Screen'>
                    <div className='user_profile'>
                      <img src={userData?.data?.profile} alt='wrteam' onError={imgError} />
                      <p className='mt-3'>{userData?.data?.name || userData?.data?.email || userData?.data?.mobile}</p>
                    </div>
                    {battleUserData?.map((data, index) => {
                      return (
                        <>
                          <div className='vs_image'>
                            <img src={vsimg.src} alt='versus' height={100} width={50} />
                          </div>
                          <div className='opponent_image' key={index}>
                            <img src={data.profileUrl} alt='wrteam' onError={imgError} />
                            <p className='mt-3'>{data.name ? data.name : t('Waiting')}</p>
                          </div>
                        </>
                      )
                    })}
                  </div>
                </div>
              </div>
            </>
          </Modal>
        ) : (
          ''
        )
      }
    </>
  )
}

export default withTranslation()(PlaywithFriendBattle)
