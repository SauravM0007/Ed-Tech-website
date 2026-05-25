import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactStars from "react-rating-stars-component";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "../../App.css";
import { FaStar } from "react-icons/fa";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { Autoplay, Pagination } from "swiper/modules";

import { apiConnector } from "../../services/apiConnector";
import { ratingsEndpoints } from "../../services/apis";
import { FAKE_REVIEWS } from "../../data/fakeReviews";

const truncateWords = 15;

const normalizeApiReview = (review) => ({
  id: review?._id,
  user: review?.user || { firstName: "Student", lastName: "" },
  course: review?.course || { courseName: "StudyNotion Course" },
  review: review?.review || "",
  rating: Number(review?.rating) || 5,
});

function ReviewSlider({ courseName = null }) {
  const swiperRef = useRef(null);
  const [apiReviews, setApiReviews] = useState([]);

  const slidePrev = () => swiperRef.current?.slidePrev();
  const slideNext = () => swiperRef.current?.slideNext();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiConnector(
          "GET",
          ratingsEndpoints.REVIEWS_DETAILS_API
        );
        if (data?.success && Array.isArray(data?.data)) {
          setApiReviews(data.data.map(normalizeApiReview));
        }
      } catch (error) {
        console.log("Could not fetch reviews, using sample reviews.", error);
      }
    })();
  }, []);

  const reviews = useMemo(() => {
    const realReviews = apiReviews.filter((r) => r.review?.trim());
    let combined = [...FAKE_REVIEWS, ...realReviews];

    if (courseName) {
      const normalizedCourse = courseName.trim().toLowerCase();
      const forCourse = FAKE_REVIEWS.filter(
        (r) => r.course?.courseName?.trim().toLowerCase() === normalizedCourse
      );
      const others = FAKE_REVIEWS.filter(
        (r) => r.course?.courseName?.trim().toLowerCase() !== normalizedCourse
      ).slice(0, 4);

      combined =
        forCourse.length > 0
          ? [
              ...forCourse,
              ...others,
              ...realReviews.map((r) => ({
                ...r,
                course: { courseName },
              })),
            ]
          : [
              ...FAKE_REVIEWS.slice(0, 6).map((r) => ({
                ...r,
                course: { courseName },
              })),
              ...realReviews,
            ];
    }

    const seen = new Set();
    return combined.filter((item) => {
      const key = item.id || `${item.user?.firstName}-${item.review}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [apiReviews, courseName]);

  const getAvatar = (review) =>
    review?.user?.image ||
    `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`;

  const formatReviewText = (text) => {
    if (!text) return "";
    const words = text.split(" ");
    return words.length > truncateWords
      ? `${words.slice(0, truncateWords).join(" ")} ...`
      : text;
  };

  return (
    <div className="w-full text-white">
      <div className="relative mx-auto flex min-h-[200px] w-full max-w-maxContentTab items-center gap-2 lg:max-w-maxContent">
        <button
          type="button"
          onClick={slidePrev}
          aria-label="Previous reviews"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-richblack-600 bg-richblack-800 text-xl text-yellow-50 transition-all duration-200 hover:border-yellow-50 hover:bg-richblack-700 sm:h-12 sm:w-12"
        >
          <IoChevronBack />
        </button>

        <div className="min-w-0 flex-1">
          <Swiper
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            slidesPerView={1}
            spaceBetween={20}
            loop={reviews.length > 1}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{ clickable: true }}
            modules={[Pagination, Autoplay]}
            breakpoints={{
              480: { slidesPerView: 1 },
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            className="review-swiper w-full pb-10"
          >
          {reviews.map((review) => (
            <SwiperSlide key={review.id || review.review}>
              <div className="flex h-full min-h-[180px] flex-col gap-3 rounded-lg border border-richblack-700 bg-richblack-800 p-4 text-sm text-richblack-25">
                <div className="flex items-center gap-4">
                  <img
                    src={getAvatar(review)}
                    alt={`${review?.user?.firstName} ${review?.user?.lastName}`}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex flex-col">
                    <h3 className="truncate font-semibold text-richblack-5">{`${review?.user?.firstName} ${review?.user?.lastName}`}</h3>
                    <p className="truncate text-xs font-medium text-richblack-500">
                      {review?.course?.courseName}
                    </p>
                  </div>
                </div>
                <p className="flex-1 font-medium leading-relaxed text-richblack-25">
                  {formatReviewText(review.review)}
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-yellow-100">
                    {Number(review.rating).toFixed(1)}
                  </span>
                  <ReactStars
                    count={5}
                    value={Number(review.rating)}
                    size={18}
                    edit={false}
                    activeColor="#ffd700"
                    emptyIcon={<FaStar />}
                    fullIcon={<FaStar />}
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
          </Swiper>
        </div>

        <button
          type="button"
          onClick={slideNext}
          aria-label="Next reviews"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-richblack-600 bg-richblack-800 text-xl text-yellow-50 transition-all duration-200 hover:border-yellow-50 hover:bg-richblack-700 sm:h-12 sm:w-12"
        >
          <IoChevronForward />
        </button>
      </div>
    </div>
  );
}

export default ReviewSlider;
