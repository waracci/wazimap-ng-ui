import {SubIndicator} from '../dataobjects'
import {checkIfSubCategoryHasChildren} from "../utils";


const hideondeployClsName = 'hideondeploy';
const parentContainer = $(".data-mapper-content__list");
const categoryTemplate = $(".data-category")[0].cloneNode(true);
const subCategoryTemplate = $(".data-category__h2", categoryTemplate)[0].cloneNode(true);
const indicatorTemplate = $(".data-category__h2_content", subCategoryTemplate)[0].cloneNode(true);
const indicatorItemTemplate = $(".data-category__h4", subCategoryTemplate)[0].cloneNode(true);
const noDataWrapperClsName = 'data-mapper-content__no-data';
const loadingClsName = 'data-mapper-content__loading';

function subindicatorsInCategory(category) {
    let count = 0;
    let subcategories = Object.values(category.subcategories);
    for (const idx in subcategories) {
        let subcategory = subcategories[idx];
        count += subindicatorsInSubCategory(subcategory);
    }

    return count;
}

function subindicatorsInSubCategory(subcategory) {

    let count = 0;
    const indicators = Object.values(subcategory.indicators);
    if (indicators.length > 0) {
        for (const idx in indicators) {
            let indicator = indicators[idx];
            count += subindicatorsInIndicator(indicator);
        }
    }

    return count;
}

function subindicatorsInIndicator(indicator) {
  return indicator.metadata.groups.length;
}

// TODO this entire file needs to be refactored to use thhe observer pattern
export function loadMenu(data, subindicatorCallback) {
    function addSubIndicators(wrapper, category, subcategory, indicator, groups, indicators, choropleth_method, indicatorId) {

        $(".data-category__h3", wrapper).remove();
        $(".data-category__h4", wrapper).remove();

        if (groups !== null && typeof groups.subindicators !== 'undefined') {
            groups.subindicators.forEach((subindicator) => {
                const newSubIndicatorElement = indicatorItemTemplate.cloneNode(true);
                $(".truncate", newSubIndicatorElement).text(subindicator);
                $(newSubIndicatorElement).attr('title', subindicator);

                wrapper.append(newSubIndicatorElement);

                const parents = {
                    category: category,
                    subcategory: subcategory,
                    indicator: indicator
                }

                $(newSubIndicatorElement).on("click", (el) => {
                    setActive(el);
                    if (subindicatorCallback != undefined)
                        subindicatorCallback({
                            el: el,
                            data: data,
                            indicatorTitle: indicator,
                            selectedSubindicator: subindicator,
                            indicators: indicators,
                            parents: parents,
                            choropleth_method: choropleth_method,
                            indicatorId: indicatorId
                        })
                });
            });
        }
    }

    function addIndicators(wrapper, category, subcategory, indicators) {
        var newSubCategory = subCategoryTemplate.cloneNode(true);

        $(".data-category__h2_trigger div", newSubCategory).text(subcategory);
        wrapper.append(newSubCategory);

        var h3Wrapper = $(".data-category__h2_wrapper", newSubCategory);

        let indicatorClone = $(h3Wrapper).find('.data-category__h3')[0].cloneNode(true);
        $(".data-category__h3", h3Wrapper).remove();

        for (const [indicator, detail] of Object.entries(indicators)) {
            let newIndicator = indicatorClone.cloneNode(true);
            $('.truncate', newIndicator).text(indicator);
            $(h3Wrapper).append(newIndicator);
            const childWrapper = $(newIndicator).find('.data-category__h3_wrapper');

            let subindicators = detail.metadata.groups.filter((group) => group.name === detail.metadata.primary_group)[0];
            addSubIndicators(childWrapper, category, subcategory, indicator, subindicators, indicators, detail.choropleth_method, detail.id);
        }
    }

    function addSubcategories(wrapper, category, subcategories) {
        var newCategory = categoryTemplate.cloneNode(true)
        $(newCategory).removeClass(hideondeployClsName);
        $(".data-category__h1_title div", newCategory).text(category);
        $('.' + loadingClsName).addClass('hidden');
        $('.' + noDataWrapperClsName).addClass('hidden');
        parentContainer.append(newCategory);
        var h2Wrapper = $(".data-category__h1_wrapper", newCategory);
        $(".data-category__h2", h2Wrapper).remove();

        for (const [subcategory, detail] of Object.entries(subcategories)) {
            let count = subindicatorsInSubCategory(detail);
            if (count > 0) {
                addIndicators(h2Wrapper, category, subcategory, detail.indicators);
            }
        }
    }

    function setActive(el) {
        resetActive();
        $(this).addClass("menu__link_h4--active")
    }

    function resetActive() {
        $(".menu__link_h4--active", parentContainer).removeClass("menu__link_h4--active");
    }

    $(".data-menu__category").remove();
    let hasNoItems = true;
    $(parentContainer).find('.data-category').remove();


    for (const [category, detail] of Object.entries(data)) {
        let count = subindicatorsInCategory(detail);

        if (count > 0) {
            if (!$('.' + noDataWrapperClsName).hasClass(hideondeployClsName)) {
                $('.' + noDataWrapperClsName).addClass(hideondeployClsName);
            }
            hasNoItems = false;

            addSubcategories(parentContainer, category, detail.subcategories)
        }
    }

    if (hasNoItems) {
        if ($('.' + noDataWrapperClsName).hasClass(hideondeployClsName)) {
            $('.' + noDataWrapperClsName).removeClass(hideondeployClsName);
        }
    }
}

export function showNoData() {
    $(parentContainer).empty();
    $('.' + loadingClsName).addClass('hidden');
    $('.' + noDataWrapperClsName).removeClass('hidden');
}
