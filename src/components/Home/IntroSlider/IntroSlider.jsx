'use client'
import React, { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { useSelector } from 'react-redux'
import { t } from 'i18next'
import { withTranslation } from 'react-i18next'
import Skeleton from 'react-loading-skeleton'
import { selectCurrentLanguage } from 'src/store/reducers/languageSlice'
import Link from 'next/link'
import { sliderApi } from 'src/store/actions/campaign'

import 'swiper/css/effect-fade'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// import required modules
import { EffectFade, Navigation, Pagination, Autoplay } from 'swiper/modules'
import { truncate } from 'src/utils'

const IntroSlider = () => {
  const selectcurrentLanguage = useSelector(selectCurrentLanguage)
  const [sliders, setSliders] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const newSliders = () => {
    setIsLoading(true)
    sliderApi(
      response => {
        setSliders(response.data)
        setIsLoading(false)
      },
      error => {
        if (error === '102') {
          setSliders([])
          setIsLoading(false)
        }
      }
    )
  }

  useEffect(() => {
      newSliders()
  }, [selectcurrentLanguage])


  return (
    <div className='intro-slider-wrap section'>
      <div className='container'>
        <Swiper
          // loop={true}
          spaceBetween={30}
          effect={'fade'}
          speed={500}
          autoplay={true}
          navigation={false}
          pagination={{
            clickable: true
          }}
          fadeEffect={{
            crossFade: true
          }}

          modules={[EffectFade, Navigation, Pagination, Autoplay]}
          className='mySwiper'

        >
          {isLoading ? (
            // Show skeleton loading when data is being fetched
            <div className='col-12 loading_data'>
              <Skeleton height={20} count={22} />
            </div>
          ) : sliders && sliders?.length > 0 ? (
            sliders.map((data, key) => (
              <SwiperSlide key={key}>
                <div className='slide2'>
                  <div className='container position-relative px-0'>
                    <div className='row align-items-center'>

                      <div className='col-lg-6 col-12 mb-4 `'>
                        <div className='slider__content'>
                          <h3>{data && truncate(data.title,44)}</h3>
                          <p className='mb-4'>{data && data.description ? data.description : <Skeleton />}</p>
                        </div>
                        <Link href={'/all-games'} className='btn btn-primary slider1__btn me-2'>
                          {t('Lets Play')}
                        </Link>
                        <Link href={'/contact-us'} className='btn slider1__btn2 text-white'>
                          {t('Contact Us')}
                        </Link>
                      </div>
                      <div className='col-lg-6 col-12'>
                        <div className='outer__slide1__img'>
                          {data.image ? <img src={data.image} alt='slider' /> : <Skeleton height={400} count={5} />}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))
          ) : (
              null
          )}
        </Swiper>
      </div>
    </div>
  )
}

export default withTranslation()(IntroSlider)
