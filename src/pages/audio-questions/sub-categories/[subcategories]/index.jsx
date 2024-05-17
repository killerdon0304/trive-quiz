"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { withTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import { t } from "i18next";
import { useSelector } from "react-redux";
import { UserCoinScoreApi, getusercoinsApi, subcategoriesApi, unlockpremiumcateApi } from "src/store/actions/campaign";
import { selectCurrentLanguage } from "src/store/reducers/languageSlice";
import Breadcrumb from "src/components/Common/Breadcrumb";
import { FiChevronRight } from "react-icons/fi";
import { useRouter } from "next/router";
import premium from "src/assets/images/c1.svg"
import Image from "next/image";
import errorimg from "src/assets/images/error.svg"
import withReactContent from 'sweetalert2-react-content'
import Swal from 'sweetalert2'
import { updateUserDataInfo } from "src/store/reducers/userSlice";
import dynamic from 'next/dynamic'
import { Loadtempdata } from "src/store/reducers/tempDataSlice";
import excla from 'src/assets/images/exclamation.svg'
const Layout = dynamic(() => import('src/components/Layout/Layout'), { ssr: false })
const MySwal = withReactContent(Swal)

const AudioQuestions = () => {
  const [subCategory, setsubCategory] = useState([]);
  const [subloading, setSubLoading] = useState(true);
  const selectcurrentLanguage = useSelector(selectCurrentLanguage);

  const router = useRouter();
  // console.log(router)
  const cateSlug = router.query.subcategories;

  const getAllData = () => {
    if (cateSlug) {
      subcategoriesApi(
        cateSlug,
        "",
        (response) => {

          let subcategories = response.data;
          // console.log(subcategories)
          if (!response.error && subcategories) {
            setsubCategory(subcategories);
            setSubLoading(false);
          }
        },
        (error) => {
          console.log(error);
          setSubLoading(false);
          setsubCategory("");
          toast.error(t("No Subcategories Data Found"));
        }
      );
    } else {
      toast.error(t("No Data found"));
    }
  };

  //handle subcatgory
  const handleChangeSubCategory = (data) => {
    if (data.has_unlocked === '0' && data.is_premium === '1') {
      getusercoinsApi(
        res => {
          if (Number(data.coins) > Number(res.data.coins)) {
            MySwal.fire({
              text: t("You Don't have enough coins"),
              icon: 'warning',
              showCancelButton: false,
              customClass: {
                confirmButton: 'Swal-confirm-buttons',
                cancelButton: "Swal-cancel-buttons"
              },
              confirmButtonText: `OK`,
              allowOutsideClick: false
            })
          } else {
            MySwal.fire({
              text: t('Double your Coins and achieve a higher Score.'),
              icon: 'warning',
              showCancelButton: true,
              customClass: {
                confirmButton: 'Swal-confirm-buttons',
                cancelButton: "Swal-cancel-buttons"
              },
              confirmButtonText: `use ${data.coins} coins`,
              allowOutsideClick: false
            }).then(result => {
              if (result.isConfirmed) {
                unlockpremiumcateApi(
                  data.maincat_id,
                  data.id,
                  res => {
                    getAllData()
                    UserCoinScoreApi(
                      '-' + data.coins,
                      null,
                      null,
                      'Audio Questions Premium SubCategories',
                      '1',
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
                  },
                  err => console.log(err)
                )
              }
            })
          }
        },
        err => {
          console.log(err)
        }
      )

    } else {
      Loadtempdata(data)
      router.push({
        pathname: `/audio-questions/audio-questions-play`, query: {
          subcatid: data.id,
          is_play: data.is_play

        }
      })
    }
  };

  //truncate text
  const truncate = (txtlength) => (txtlength?.length > 17 ? `${txtlength.substring(0, 17)}...` : txtlength);

  useEffect(() => {
    if (!router.isReady) return;
    getAllData();
  }, [router.isReady, selectcurrentLanguage]);

  return (
    <Layout>

      <Breadcrumb showBreadcrumb={true} title={t("Audio Questions")} content={t("Home")} contentTwo={subCategory[0]?.category_name} contentThree="" />
      <div className="quizplay mb-5">
        <div className="container">
          <div className="row morphisam mb-5">
            {/* sub category middle sec */}
            <div className="col-xxl-12 col-xl-12 col-lg-12 col-md-12 col-12">
              <div className="right-sec">
                <div className="subcat__slider__context">
                  <div className="container">
                    <div className="row">
                      <div className="quizplay-slider">
                        {subloading ? (
                          <div className="text-center">
                            <Skeleton count={5} />
                          </div>
                        ) : (
                          <div className="row">
                            <>
                              {subCategory ? (
                                subCategory?.length > 0 &&
                                subCategory.map((elem, key) => {
                                  return (
                                    <div
                                      key={elem.id}
                                      className="col-sm-12 col-md-6 col-lg-4"
                                      onClick={(e) => {
                                        handleChangeSubCategory(elem);
                                      }}
                                    >
                                      <div className="subcatintro__sec">
                                        <div className={`card spandiv`}>
                                          <div className="cardInnerData">
                                            <span className="Box__icon">
                                            <img src={elem.image ? elem.image : `${excla.src}`} alt='image' />
                                            </span>
                                            <div className="cardDetails">
                                              <p className="cardText ">{elem.subcategory_name}</p>

                                              <div className="cardSubDetails">

                                                <p className="CardQues">
                                                  {" "}
                                                  {
                                                    elem.no_of_que <= 1 ? t("Question") : t("Questions")
                                                  } : {elem.no_of_que}
                                                </p>
                                                <div className="premium">
                                                  {elem.has_unlocked === "0" && elem.is_premium === "1" ? <Image src={premium} width={30} height={30} alt="premium" /> : null}
                                                </div>
                                              </div>
                                            </div>
                                            <span className="rightArrow">
                                              <FiChevronRight />
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-center mt-4 commonerror">
                                  <img src={errorimg.src} title="wrteam" className="error_img" />
                                  <p>{t("No Subcategories Data Found")}</p>
                                </div>
                              )}
                            </>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default withTranslation()(AudioQuestions);
