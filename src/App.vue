<script setup lang="ts">
import zhCN from 'ant-design-vue/locale/zh_CN';
import { PureTabs } from '@/components';
</script>

<template>
    <AConfigProvider :locale="zhCN">
        <AApp>
            <ALayout class="page-layout">
                <!--        <ALayoutHeader class="layout-header">-->
                <!--          <main class="layout-main">-->
                <!--            <section class="item logo-text">-->
                <!--            <span class="logo cp"  @click='jumpToIndex'></span>-->
                <!--            <span class="text cp" @click='jumpToIndex'>-->
                <!--            CodeYell-->
                <!--            </span>-->
                <!--            </section>-->
                <!--            <section class="item nav-bar" >-->
                <!--            <PureTabs-->
                <!--                activeKey={pathname}-->
                <!--                config={navTabConfig}-->
                <!--                onChange={(key) => history.push(key)}-->
                <!--            />-->
                <!--            </section>-->

                <!--            <AInputSearch-->
                <!--                allowClear-->
                <!--                className={'item search-bar'}-->
                <!--            maxLength={50}-->
                <!--            onSearch={handleSearch}-->
                <!--            placeholder="搜索项目"-->
                <!--            />-->

                <!--            <section className={'item register-login'}>-->
                <!--            <Space size={'middle'}>-->
                <!--              {authContent}-->

                <!--              <Select-->
                <!--                  defaultValue="chinese"-->
                <!--                  onChange={() => {-->
                <!--              //切换语言-->
                <!--              }}-->
                <!--              options={[-->
                <!--              {-->
                <!--              value: 'chinese',-->
                <!--              label: '中文'-->
                <!--              },-->
                <!--              {-->
                <!--              value: 'english',-->
                <!--              label: 'English'-->
                <!--              }-->
                <!--              ]}-->
                <!--              style={{ width: 120 }}-->
                <!--              />-->
                <!--            </Space>-->
                <!--            </section>-->
                <!--          </main>-->
                <!--        </ALayoutHeader>-->
                <!--        <Content className={'layout-content'}>-->
                <!--          <main className={'layout-main'}>-->
                <!--            <Outlet />-->
                <!--          </main>-->
                <!--          <Footer className={'layout-footer'}>-->
                <!--            <main className={'layout-main'}>-->
                <!--              <span className={'logo'}></span>-->
                <!--              <Space className={'item text'} size={'large'}>-->
                <!--              <span>邮箱：<a href='mailto:i@lifang.biz'>i@lifang.biz</a></span>-->
                <!--              <span>@2024 西安立方网络科技有限公司</span>-->
                <!--              <span>-->
                <!--                                        <a-->
                <!--                                            href="https://beian.miit.gov.cn"-->
                <!--                                            rel="noreferrer"-->
                <!--                                            target="_blank"-->
                <!--                                        >-->
                <!--                                            陕ICP备15013641号-10-->
                <!--                                        </a>-->
                <!--                                    </span>-->
                <!--              </Space>-->
                <!--            </main>-->
                <!--          </Footer>-->
                <!--        </Content>-->
            </ALayout>
        </AApp>
    </AConfigProvider>
    <router-view />
</template>
